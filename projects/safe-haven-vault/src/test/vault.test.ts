import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Vault Seed Data Security", () => {
  it("should not contain hardcoded passwords or secrets in VaultContext.tsx", () => {
    const contextFilePath = path.resolve(__dirname, "../contexts/VaultContext.tsx");
    const content = fs.readFileSync(contextFilePath, "utf-8");

    // Ensure known sensitive strings are removed
    expect(content).not.toContain("Tw!tter2024#Secure");
    expect(content).not.toContain("Ch@se$ecure99!");
    expect(content).not.toContain("Sl@ckW0rk!2024");
    expect(content).not.toContain("Am@z0nPrime#Shop");
    expect(content).not.toContain("Gm@il$ecure!Pass");

    // Ensure placeholders are used for seed password fields
    expect(content).toContain('password: "[DEMO-PASSWORD-PLACEHOLDER]"');
  });
});
