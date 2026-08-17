// ─── Crypto Utilities for VaultX ───
// PIN hashing, key derivation, AES-GCM encryption/decryption

const SALT_KEY = "vault_pbkdf2_salt";
const PIN_HASH_KEY = "vault_master_pin_hash";
const PBKDF2_ITERATIONS = 100000;

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuf(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}

function bufToBase64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function base64ToBuf(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

// SHA-256 hash a PIN string
export async function hashPin(pin: string): Promise<string> {
  const encoded = new TextEncoder().encode(pin);
  const hash = await crypto.subtle.digest("SHA-256", encoded);
  return bufToHex(hash);
}

// Check if a PIN matches the stored hash
export async function verifyPin(pin: string): Promise<boolean> {
  const storedHash = localStorage.getItem(PIN_HASH_KEY);
  if (!storedHash) return false;
  const inputHash = await hashPin(pin);
  return inputHash === storedHash;
}

// Store hashed PIN
export async function storePin(pin: string): Promise<void> {
  const hash = await hashPin(pin);
  localStorage.setItem(PIN_HASH_KEY, hash);
  // Ensure salt exists
  ensureSalt();
}

// Check if PIN is set
export function isPinSet(): boolean {
  return localStorage.getItem(PIN_HASH_KEY) !== null;
}

// Ensure PBKDF2 salt exists
function ensureSalt(): string {
  let salt = localStorage.getItem(SALT_KEY);
  if (!salt) {
    const saltBytes = new Uint8Array(16);
    crypto.getRandomValues(saltBytes);
    salt = bufToHex(saltBytes.buffer);
    localStorage.setItem(SALT_KEY, salt);
  }
  return salt;
}

// Derive AES-GCM key from PIN using PBKDF2
export async function deriveKey(pin: string): Promise<CryptoKey> {
  const salt = ensureSalt();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pin),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: hexToBuf(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// Encrypt a string with AES-GCM, returns { ciphertext, iv } as base64
export async function encrypt(
  plaintext: string,
  key: CryptoKey
): Promise<{ ciphertext: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );
  return {
    ciphertext: bufToBase64(encrypted),
    iv: bufToBase64(iv.buffer),
  };
}

// Decrypt AES-GCM ciphertext
export async function decrypt(
  ciphertext: string,
  iv: string,
  key: CryptoKey
): Promise<string> {
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBuf(iv) },
    key,
    base64ToBuf(ciphertext)
  );
  return new TextDecoder().decode(decrypted);
}

// Secure password generator
export interface PasswordGenOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

export function generatePassword(opts: PasswordGenOptions): string {
  let chars = "";
  const upper = opts.excludeAmbiguous ? "ABCDEFGHJKLMNPQRSTUVWXYZ" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = opts.excludeAmbiguous ? "abcdefghjkmnpqrstuvwxyz" : "abcdefghijklmnopqrstuvwxyz";
  const nums = opts.excludeAmbiguous ? "23456789" : "0123456789";
  const syms = "!@#$%^&*";

  if (opts.uppercase) chars += upper;
  if (opts.lowercase) chars += lower;
  if (opts.numbers) chars += nums;
  if (opts.symbols) chars += syms;

  if (chars.length === 0) chars = lower + nums;

  const arr = new Uint32Array(opts.length);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((n) => chars[n % chars.length])
    .join("");
}

// Password strength scorer
export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
  tip: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const uniqueChars = new Set(password).size;
  if (uniqueChars === password.length || (password.length > 8 && uniqueChars >= password.length * 0.7)) score++;

  let label: string, color: string, tip: string;
  if (score <= 2) {
    label = "Weak"; color = "destructive"; tip = "Add more characters, numbers, and symbols";
  } else if (score <= 4) {
    label = "Fair"; color = "warning"; tip = "Try adding symbols or increasing length";
  } else if (score <= 6) {
    label = "Good"; color = "warning"; tip = "Almost there! Add more variety";
  } else {
    label = "Strong"; color = "success"; tip = "Great password!";
  }

  return { score: Math.min(score, 7), label, color, tip };
}

// Wipe all vault data
export function wipeAllData(): void {
  localStorage.removeItem(PIN_HASH_KEY);
  localStorage.removeItem(SALT_KEY);
  localStorage.removeItem("vault_entries");
  localStorage.removeItem("vault_auto_lock");
}
