import { generateRandomString, hashData } from "../../src/utils/crypto";

describe("Crypto Utils", () => {
  describe("generateRandomString", () => {
    it("should generate random string with default length", () => {
      const result = generateRandomString();

      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result.length).toBe(64); // hex encoding doubles the length
      expect(result).toMatch(/^[a-f0-9]+$/); // hex string
    });

    it("should generate random string with custom length", () => {
      const result = generateRandomString(16);

      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result.length).toBe(32); // hex encoding doubles the length
      expect(result).toMatch(/^[a-f0-9]+$/); // hex string
    });

    it("should generate different strings on each call", () => {
      const result1 = generateRandomString(8);
      const result2 = generateRandomString(8);

      expect(result1).not.toBe(result2);
      expect(result1.length).toBe(16); // hex encoding doubles the length
      expect(result2.length).toBe(16);
    });

    it("should handle zero length", () => {
      const result = generateRandomString(0);

      expect(result).toBe("");
      expect(result.length).toBe(0);
    });

    it("should handle negative length gracefully", () => {
      expect(() => generateRandomString(-5)).toThrow();
      expect(() => generateRandomString(-5)).toThrow(
        'The value of "size" is out of range'
      );
    });
  });

  describe("hashData", () => {
    it("should hash data consistently", () => {
      const data = "test data";
      const hash1 = hashData(data);
      const hash2 = hashData(data);

      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/); // SHA-256 produces 64 hex chars
    });

    it("should produce different hashes for different data", () => {
      const hash1 = hashData("data1");
      const hash2 = hashData("data2");

      expect(hash1).not.toBe(hash2);
    });

    it("should handle empty string", () => {
      const hash = hashData("");

      expect(hash).toBeDefined();
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it("should handle special characters", () => {
      const data = "!@#$%^&*()_+-=[]{}|;:,.<>?";
      const hash = hashData(data);

      expect(hash).toBeDefined();
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it("should handle unicode characters", () => {
      const data = "Hello 世界 🌍";
      const hash = hashData(data);

      expect(hash).toBeDefined();
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });
});
