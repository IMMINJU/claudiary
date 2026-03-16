import { randomBytes, createHash } from "crypto";
import { API_KEY_PREFIX, API_KEY_BYTE_LENGTH } from "@/lib/constants";

export function generateApiKey(): string {
  const random = randomBytes(API_KEY_BYTE_LENGTH).toString("base64url");
  return `${API_KEY_PREFIX}${random}`;
}

export function hashApiKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function verifyApiKey(raw: string, hash: string): boolean {
  return hashApiKey(raw) === hash;
}

export function getKeyPrefix(raw: string): string {
  return raw.slice(0, API_KEY_PREFIX.length + 8);
}
