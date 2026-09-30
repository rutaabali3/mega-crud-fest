import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isSafeUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;

  // Remove control characters (ASCII 0-31, 127) and whitespace
  let cleanUrl = "";
  for (let i = 0; i < url.length; i++) {
    const code = url.charCodeAt(i);
    if (code > 32 && code !== 127) {
      cleanUrl += url[i];
    }
  }
  cleanUrl = cleanUrl.trim();
  const lower = cleanUrl.toLowerCase();

  // Explicitly block dangerous protocols
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:")
  ) {
    return false;
  }

  try {
    const base = typeof window !== "undefined" && window.location && window.location.origin ? window.location.origin : "http://localhost";
    const parsed = new URL(cleanUrl, base);

    if (parsed.protocol === "http:" || parsed.protocol === "https:" || parsed.protocol === "blob:") {
      return true;
    }

    if (parsed.protocol === "data:") {
      return lower.startsWith("data:image/");
    }

    return false;
  } catch {
    return false;
  }
}

export function sanitizeUrl(url: string, fallback = "#"): string {
  return isSafeUrl(url) ? url.trim() : fallback;
}
