import { describe, it, expect } from "vitest";
import ko from "../../../messages/ko.json";
import en from "../../../messages/en.json";

function getKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null) {
      keys.push(...getKeys(obj[key] as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

describe("i18n 번역 키", () => {
  const koKeys = getKeys(ko).sort();
  const enKeys = getKeys(en).sort();

  it("ko와 en의 번역 키가 동일하다", () => {
    expect(koKeys).toEqual(enKeys);
  });

  it("landing 섹션 키가 모두 존재한다", () => {
    const requiredLandingKeys = [
      "landing.hero",
      "landing.heroDescription",
      "landing.getStarted",
      "landing.howItWorks",
      "landing.demoBlogTitle",
      "landing.demoBlogContent",
      "landing.chat1User",
      "landing.chat1Claude",
      "landing.privacy",
    ];
    for (const key of requiredLandingKeys) {
      expect(koKeys).toContain(key);
      expect(enKeys).toContain(key);
    }
  });

  it("빈 번역 값이 없다", () => {
    for (const key of koKeys) {
      const value = key.split(".").reduce((o: unknown, k) => (o as Record<string, unknown>)[k], ko);
      expect(value, `ko.${key} is empty`).not.toBe("");
    }
    for (const key of enKeys) {
      const value = key.split(".").reduce((o: unknown, k) => (o as Record<string, unknown>)[k], en);
      expect(value, `en.${key} is empty`).not.toBe("");
    }
  });
});
