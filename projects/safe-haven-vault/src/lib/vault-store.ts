import { VaultEntry } from "./types";

const ENTRIES_KEY = "vault_entries";

export function loadEntries(): VaultEntry[] {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveEntries(entries: VaultEntry[]): void {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export function getStorageUsed(): string {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)!;
    total += key.length + (localStorage.getItem(key)?.length || 0);
  }
  if (total < 1024) return `${total} B`;
  if (total < 1024 * 1024) return `${(total / 1024).toFixed(1)} KB`;
  return `${(total / (1024 * 1024)).toFixed(2)} MB`;
}
