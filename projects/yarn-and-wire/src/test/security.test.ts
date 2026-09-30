import { describe, it, expect } from "vitest";
import { sanitizeUrl } from "../lib/security";

describe("sanitizeUrl", () => {
  it("allows valid http and https URLs", () => {
    expect(sanitizeUrl("https://example.com/pattern")).toBe("https://example.com/pattern");
    expect(sanitizeUrl("http://example.com/pattern")).toBe("http://example.com/pattern");
    expect(sanitizeUrl("HTTPS://EXAMPLE.COM/PATTERN")).toBe("HTTPS://EXAMPLE.COM/PATTERN");
  });

  it("rejects javascript: URIs", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBe("");
    expect(sanitizeUrl("javascript:alert(document.domain)")).toBe("");
    expect(sanitizeUrl("JAVASCRIPT:alert('XSS')")).toBe("");
    expect(sanitizeUrl("java\0script:alert(1)")).toBe("");
  });

  it("rejects data: and vbscript: URIs", () => {
    expect(sanitizeUrl("data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==")).toBe("");
    expect(sanitizeUrl("vbscript:msgbox(1)")).toBe("");
  });

  it("returns empty string for empty, undefined, null, or malformed inputs", () => {
    expect(sanitizeUrl("")).toBe("");
    expect(sanitizeUrl("   ")).toBe("");
    expect(sanitizeUrl(null)).toBe("");
    expect(sanitizeUrl(undefined)).toBe("");
    expect(sanitizeUrl("not-a-valid-url")).toBe("");
  });
});
