import { describe, it, expect } from "vitest";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

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
