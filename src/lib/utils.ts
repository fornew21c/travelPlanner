import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateShareToken(): string {
  // 22-char URL-safe token. Crypto.randomUUID minus dashes + truncated.
  return crypto.randomUUID().replace(/-/g, "").slice(0, 22);
}

export function safeJsonParse<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
