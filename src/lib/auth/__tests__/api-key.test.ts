import { describe, it, expect } from "vitest";
import {
  generateApiKey,
  hashApiKey,
  verifyApiKey,
  getKeyPrefix,
} from "../api-key";
import { API_KEY_PREFIX } from "@/lib/constants";

describe("API Key 유틸", () => {
  describe("generateApiKey", () => {
    it("cldy_ 프리픽스로 시작한다", () => {
      const key = generateApiKey();
      expect(key.startsWith(API_KEY_PREFIX)).toBe(true);
    });

    it("매번 다른 키를 생성한다", () => {
      const key1 = generateApiKey();
      const key2 = generateApiKey();
      expect(key1).not.toBe(key2);
    });

    it("충분한 길이를 가진다", () => {
      const key = generateApiKey();
      // cldy_ (5) + base64url(32 bytes) = 5 + 43 = 48
      expect(key.length).toBeGreaterThanOrEqual(40);
    });
  });

  describe("hashApiKey", () => {
    it("SHA-256 hex 해시를 반환한다 (64자)", () => {
      const hash = hashApiKey("cldy_test123");
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[a-f0-9]+$/);
    });

    it("동일 키는 항상 같은 해시를 생성한다", () => {
      const key = "cldy_deterministic_test";
      expect(hashApiKey(key)).toBe(hashApiKey(key));
    });

    it("다른 키는 다른 해시를 생성한다", () => {
      expect(hashApiKey("cldy_aaa")).not.toBe(hashApiKey("cldy_bbb"));
    });
  });

  describe("verifyApiKey", () => {
    it("올바른 키와 해시 쌍이면 true", () => {
      const key = generateApiKey();
      const hash = hashApiKey(key);
      expect(verifyApiKey(key, hash)).toBe(true);
    });

    it("잘못된 키면 false", () => {
      const key = generateApiKey();
      const hash = hashApiKey(key);
      expect(verifyApiKey("cldy_wrong_key", hash)).toBe(false);
    });
  });

  describe("getKeyPrefix", () => {
    it("cldy_ + 8자를 반환한다", () => {
      const key = generateApiKey();
      const prefix = getKeyPrefix(key);
      expect(prefix).toHaveLength(API_KEY_PREFIX.length + 8);
      expect(prefix).toBe(key.slice(0, API_KEY_PREFIX.length + 8));
    });
  });
});
