/**
 * Sanitizes a URL to prevent Cross-Site Scripting (XSS) vulnerabilities (e.g., javascript: URIs).
 * Only allows safe protocols (http: and https:).
 *
 * @param url The URL string to sanitize
 * @returns The original URL if safe, or empty string if unsafe/invalid
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return "";

  const trimmed = url.trim();
  if (!trimmed) return "";

  // Strip control characters and invisible characters that could be used to obfuscate schemes
  const sanitizedInput = trimmed.replace(/[\x00-\x20\x7F-\x9F]/g, "");

  try {
    const parsed = new URL(sanitizedInput);
    const safeProtocols = ["http:", "https:"];
    if (safeProtocols.includes(parsed.protocol.toLowerCase())) {
      return trimmed;
    }
  } catch {
    // URL parsing failed or URL lacks a scheme
  }

  return "";
}
