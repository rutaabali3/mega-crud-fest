import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { deriveKey, isPinSet, verifyPin, storePin, wipeAllData, encrypt, decrypt } from "@/lib/crypto";
import { VaultEntry, Category, EncryptedField } from "@/lib/types";
import { loadEntries, saveEntries } from "@/lib/vault-store";

interface VaultContextType {
  isLocked: boolean;
  isPinConfigured: boolean;
  failedAttempts: number;
  lockoutUntil: number | null;
  unlock: (pin: string) => Promise<boolean>;
  lock: () => void;
  setupPin: (pin: string) => Promise<void>;
  changePin: (oldPin: string, newPin: string) => Promise<boolean>;
  entries: VaultEntry[];
  addEntry: (data: EntryFormData) => Promise<void>;
  updateEntry: (id: string, data: EntryFormData) => Promise<void>;
  deleteEntry: (id: string) => void;
  deleteEntries: (ids: string[]) => void;
  toggleFavorite: (id: string) => void;
  decryptField: (field: EncryptedField) => Promise<string>;
  encryptField: (value: string) => Promise<EncryptedField>;
  wipeVault: () => void;
  autoLockMinutes: number;
  setAutoLockMinutes: (m: number) => void;
  exportVault: () => void;
  importVault: (json: string) => Promise<boolean>;
  loadSeedData: () => Promise<void>;
}

export interface EntryFormData {
  siteName: string;
  siteUrl: string;
  username: string;
  password: string;
  notes: string;
  category: Category;
  favorite: boolean;
}

const VaultContext = createContext<VaultContextType | null>(null);

export function useVault() {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error("useVault must be used within VaultProvider");
  return ctx;
}

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(true);
  const [isPinConfigured, setIsPinConfigured] = useState(isPinSet());
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [autoLockMinutes, setAutoLockMinutesState] = useState(() => {
    const stored = localStorage.getItem("vault_auto_lock");
    return stored ? parseInt(stored, 10) : 5;
  });

  const keyRef = useRef<CryptoKey | null>(null);
  const activityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setAutoLockMinutes = useCallback((m: number) => {
    setAutoLockMinutesState(m);
    localStorage.setItem("vault_auto_lock", String(m));
  }, []);

  const lock = useCallback(() => {
    setIsLocked(true);
    keyRef.current = null;
    setEntries([]);
    if (activityTimer.current) clearTimeout(activityTimer.current);
  }, []);

  const resetActivityTimer = useCallback(() => {
    if (activityTimer.current) clearTimeout(activityTimer.current);
    if (autoLockMinutes <= 0 || isLocked) return;
    activityTimer.current = setTimeout(lock, autoLockMinutes * 60 * 1000);
  }, [autoLockMinutes, lock, isLocked]);

  // Activity listeners
  useEffect(() => {
    if (isLocked) return;
    const handler = () => resetActivityTimer();
    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    resetActivityTimer();
    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      if (activityTimer.current) clearTimeout(activityTimer.current);
    };
  }, [isLocked, resetActivityTimer]);

  const unlock = useCallback(async (pin: string): Promise<boolean> => {
    const valid = await verifyPin(pin);
    if (!valid) {
      const next = failedAttempts + 1;
      setFailedAttempts(next);
      if (next >= 3) {
        setLockoutUntil(Date.now() + 30000);
        setFailedAttempts(0);
      }
      return false;
    }
    keyRef.current = await deriveKey(pin);
    setEntries(loadEntries());
    setIsLocked(false);
    setFailedAttempts(0);
    setLockoutUntil(null);
    return true;
  }, [failedAttempts]);

  const setupPin = useCallback(async (pin: string) => {
    await storePin(pin);
    keyRef.current = await deriveKey(pin);
    setIsPinConfigured(true);
    setEntries([]);
    setIsLocked(false);
  }, []);

  const changePin = useCallback(async (oldPin: string, newPin: string): Promise<boolean> => {
    const valid = await verifyPin(oldPin);
    if (!valid) return false;

    // Re-encrypt all entries with new key
    const oldKey = await deriveKey(oldPin);
    await storePin(newPin);
    const newKey = await deriveKey(newPin);
    
    const currentEntries = loadEntries();
    const reEncrypted: VaultEntry[] = [];
    
    for (const entry of currentEntries) {
      const pw = await decrypt(entry.password.ciphertext, entry.password.iv, oldKey);
      const newPw = await encryptWithKey(pw, newKey);
      
      let newNotes: EncryptedField | null = null;
      if (entry.notes) {
        const n = await decrypt(entry.notes.ciphertext, entry.notes.iv, oldKey);
        newNotes = await encryptWithKey(n, newKey);
      }

      const newHistory = [];
      for (const h of entry.passwordHistory) {
        const hp = await decrypt(h.password.ciphertext, h.password.iv, oldKey);
        newHistory.push({ password: await encryptWithKey(hp, newKey), changedAt: h.changedAt });
      }

      reEncrypted.push({ ...entry, password: newPw, notes: newNotes, passwordHistory: newHistory });
    }

    saveEntries(reEncrypted);
    keyRef.current = newKey;
    setEntries(reEncrypted);
    return true;
  }, []);

  async function encryptWithKey(value: string, key: CryptoKey): Promise<EncryptedField> {
    return encrypt(value, key);
  }

  const encryptField = useCallback(async (value: string): Promise<EncryptedField> => {
    if (!keyRef.current) throw new Error("Vault is locked");
    return encrypt(value, keyRef.current);
  }, []);

  const decryptField = useCallback(async (field: EncryptedField): Promise<string> => {
    if (!keyRef.current) throw new Error("Vault is locked");
    return decrypt(field.ciphertext, field.iv, keyRef.current);
  }, []);

  const addEntry = useCallback(async (data: EntryFormData) => {
    if (!keyRef.current) throw new Error("Vault is locked");
    const encPw = await encrypt(data.password, keyRef.current);
    const encNotes = data.notes ? await encrypt(data.notes, keyRef.current) : null;
    const now = new Date().toISOString();
    const entry: VaultEntry = {
      id: crypto.randomUUID(),
      siteName: data.siteName,
      siteUrl: data.siteUrl,
      username: data.username,
      password: encPw,
      notes: encNotes,
      category: data.category,
      favorite: data.favorite,
      createdAt: now,
      updatedAt: now,
      passwordHistory: [],
    };
    const updated = [...loadEntries(), entry];
    saveEntries(updated);
    setEntries(updated);
  }, []);

  const updateEntry = useCallback(async (id: string, data: EntryFormData) => {
    if (!keyRef.current) throw new Error("Vault is locked");
    const all = loadEntries();
    const idx = all.findIndex((e) => e.id === id);
    if (idx === -1) return;

    const old = all[idx];
    const oldPw = await decrypt(old.password.ciphertext, old.password.iv, keyRef.current);
    
    const encPw = await encrypt(data.password, keyRef.current);
    const encNotes = data.notes ? await encrypt(data.notes, keyRef.current) : null;
    
    let history = [...old.passwordHistory];
    if (oldPw !== data.password) {
      history.push({ password: old.password, changedAt: new Date().toISOString() });
      if (history.length > 5) history = history.slice(-5);
    }

    all[idx] = {
      ...old,
      siteName: data.siteName,
      siteUrl: data.siteUrl,
      username: data.username,
      password: encPw,
      notes: encNotes,
      category: data.category,
      favorite: data.favorite,
      updatedAt: new Date().toISOString(),
      passwordHistory: history,
    };
    saveEntries(all);
    setEntries(all);
  }, []);

  const deleteEntry = useCallback((id: string) => {
    const updated = loadEntries().filter((e) => e.id !== id);
    saveEntries(updated);
    setEntries(updated);
  }, []);

  const deleteEntries = useCallback((ids: string[]) => {
    const set = new Set(ids);
    const updated = loadEntries().filter((e) => !set.has(e.id));
    saveEntries(updated);
    setEntries(updated);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    const all = loadEntries();
    const idx = all.findIndex((e) => e.id === id);
    if (idx === -1) return;
    all[idx].favorite = !all[idx].favorite;
    all[idx].updatedAt = new Date().toISOString();
    saveEntries(all);
    setEntries(all);
  }, []);

  const wipeVault = useCallback(() => {
    wipeAllData();
    keyRef.current = null;
    setEntries([]);
    setIsLocked(true);
    setIsPinConfigured(false);
  }, []);

  const exportVault = useCallback(() => {
    const data = {
      entries: loadEntries(),
      salt: localStorage.getItem("vault_pbkdf2_salt"),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vaultx-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const importVault = useCallback(async (json: string): Promise<boolean> => {
    try {
      const data = JSON.parse(json);
      if (!data.entries || !Array.isArray(data.entries)) return false;
      saveEntries(data.entries);
      setEntries(data.entries);
      return true;
    } catch {
      return false;
    }
  }, []);

  const loadSeedData = useCallback(async () => {
    if (!keyRef.current) return;
    const seeds: EntryFormData[] = [
      { siteName: "Twitter", siteUrl: "https://twitter.com", username: "john_doe", password: "Tw!tter2024#Secure", notes: "Personal account", category: "Social", favorite: true },
      { siteName: "Chase Bank", siteUrl: "https://chase.com", username: "johndoe@email.com", password: "Ch@se$ecure99!", notes: "Main checking account", category: "Finance", favorite: false },
      { siteName: "Slack", siteUrl: "https://slack.com", username: "john@company.com", password: "Sl@ckW0rk!2024", notes: "Work workspace", category: "Work", favorite: true },
      { siteName: "Amazon", siteUrl: "https://amazon.com", username: "johndoe@gmail.com", password: "Am@z0nPrime#Shop", notes: "", category: "Shopping", favorite: false },
      { siteName: "Gmail", siteUrl: "https://gmail.com", username: "johndoe@gmail.com", password: "Gm@il$ecure!Pass", notes: "Primary email", category: "Email", favorite: true },
    ];
    for (const s of seeds) {
      await addEntry(s);
    }
  }, [addEntry]);

  return (
    <VaultContext.Provider
      value={{
        isLocked, isPinConfigured, failedAttempts, lockoutUntil,
        unlock, lock, setupPin, changePin,
        entries, addEntry, updateEntry, deleteEntry, deleteEntries, toggleFavorite,
        decryptField, encryptField, wipeVault,
        autoLockMinutes, setAutoLockMinutes,
        exportVault, importVault, loadSeedData,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}
