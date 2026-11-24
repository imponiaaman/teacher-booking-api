import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err?.code === 11000) return res.status(409).json({ message: "Email already exists" });
  const status = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof AppError ? err.message : "Internal server error";
  if (status === 500) console.error(err);
  res.status(status).json({ message });
}
