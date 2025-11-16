import crypto from "crypto";

// Generate a cryptographically secure random string
export const generateRandomString = (length: number = 32): string =>
  crypto.randomBytes(length).toString("hex");

// Hash sensitive data using SHA-256
export const hashData = (data: string): string =>
  crypto.createHash("sha256").update(data).digest("hex");
