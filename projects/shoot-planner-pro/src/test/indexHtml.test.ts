import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("index.html Open Graph Title", () => {
  it("should contain og:title matching application name 'Shoot Planner Pro'", () => {
    const htmlPath = path.resolve(__dirname, "../../index.html");
    const htmlContent = fs.readFileSync(htmlPath, "utf-8");
    expect(htmlContent).toContain('<meta property="og:title" content="Shoot Planner Pro" />');
  });
});
