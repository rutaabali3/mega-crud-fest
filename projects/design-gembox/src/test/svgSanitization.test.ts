import { describe, it, expect } from "vitest";
import DOMPurify from "dompurify";

describe("SVG Sanitization", () => {
  it("removes script tags from SVG string", () => {
    const dirtySvg = '<svg><script>alert("xss")</script><circle cx="50" cy="50" r="40"/></svg>';
    const cleanSvg = DOMPurify.sanitize(dirtySvg, { USE_PROFILES: { html: true, svg: true, svgFilters: true } });
    expect(cleanSvg).not.toContain("<script>");
    expect(cleanSvg).not.toContain("alert");
    expect(cleanSvg).toContain("<circle");
  });

  it("removes inline event handlers like onload or onerror from SVG elements", () => {
    const dirtySvg = '<svg onload="alert(1)"><rect x="10" y="10" width="30" height="30" onerror="alert(2)"/></svg>';
    const cleanSvg = DOMPurify.sanitize(dirtySvg, { USE_PROFILES: { html: true, svg: true, svgFilters: true } });
    expect(cleanSvg).not.toContain("onload");
    expect(cleanSvg).not.toContain("onerror");
    expect(cleanSvg).not.toContain("alert");
    expect(cleanSvg).toContain("<rect");
  });

  it("removes javascript: links from SVG element attributes", () => {
    const dirtySvg = '<svg><a href="javascript:alert(1)"><text>Click me</text></a></svg>';
    const cleanSvg = DOMPurify.sanitize(dirtySvg, { USE_PROFILES: { html: true, svg: true, svgFilters: true } });
    expect(cleanSvg).not.toContain("javascript:");
    expect(cleanSvg).not.toContain("alert");
  });
});
