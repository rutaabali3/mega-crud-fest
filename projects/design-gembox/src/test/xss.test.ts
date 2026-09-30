import { describe, it, expect } from "vitest";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { isSafeUrl, sanitizeUrl } from "../lib/utils";

const window = new JSDOM("").window;
const purify = typeof DOMPurify.sanitize === "function" ? DOMPurify : DOMPurify(window as unknown as Window);

describe("XSS Sanitization for SVG Assets", () => {
  it("should sanitize script tags in SVG content", () => {
    const dirtySvg = `<svg><script>alert('xss')</script><circle cx="50" cy="50" r="40" /></svg>`;
    const cleanSvg = purify.sanitize(dirtySvg);
    expect(cleanSvg).not.toContain("<script>");
    expect(cleanSvg).not.toContain("alert");
    expect(cleanSvg).toContain("<circle");
  });

  it("should sanitize event handlers in SVG attributes", () => {
    const dirtySvg = `<svg onload="alert(1)"><rect width="100" height="100" onclick="alert(2)" /></svg>`;
    const cleanSvg = purify.sanitize(dirtySvg);
    expect(cleanSvg).not.toContain("onload");
    expect(cleanSvg).not.toContain("onclick");
    expect(cleanSvg).not.toContain("alert");
  });

  it("should preserve valid SVG elements and attributes", () => {
    const validSvg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M10 10 H 90 V 90 H 10 Z" fill="red" /></svg>`;
    const cleanSvg = purify.sanitize(validSvg);
    expect(cleanSvg).toContain("viewBox");
    expect(cleanSvg).toContain("path");
    expect(cleanSvg).toContain('fill="red"');
  });
});

describe("URL Sanitization for Image Assets", () => {
  it("should allow safe HTTP and HTTPS URLs", () => {
    expect(isSafeUrl("https://example.com/image.png")).toBe(true);
    expect(isSafeUrl("http://example.com/image.png")).toBe(true);
    expect(sanitizeUrl("https://example.com/image.png")).toBe("https://example.com/image.png");
  });

  it("should allow safe image Data URIs", () => {
    expect(isSafeUrl("data:image/png;base64,iVBORw0KGgoAAAANSUEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==")).toBe(true);
  });

  it("should block javascript: URIs", () => {
    expect(isSafeUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeUrl("javascript:alert('XSS')")).toBe(false);
    expect(isSafeUrl("  javascript:alert(1)  ")).toBe(false);
    expect(sanitizeUrl("javascript:alert(1)")).toBe("#");
  });

  it("should block non-image Data URIs like data:text/html", () => {
    expect(isSafeUrl("data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==")).toBe(false);
    expect(sanitizeUrl("data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==")).toBe("#");
  });

  it("should block vbscript: and file: URIs", () => {
    expect(isSafeUrl("vbscript:msgbox(1)")).toBe(false);
    expect(isSafeUrl("file:///etc/passwd")).toBe(false);
  });
});
