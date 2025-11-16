import type { Response } from "express";

// Error handling utility
export function throwError(message: string, code: number = 500): never {
  throw Object.assign(new Error(message), { code, isOperational: true });
}

// Success response utility
export function sendSuccess(
  res: Response,
  msg: string = "Success",
  data?: unknown,
  code: number = 200
): void {
  res.status(code).json({ status: "success", code, msg, data });
}
