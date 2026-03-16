import { describe, it, expect } from "vitest";
import { generateSlug } from "../slug";

describe("generateSlug", () => {
  it("영문 제목 → 소문자 하이픈 slug", () => {
    expect(generateSlug("Hello World Test")).toBe("hello-world-test");
  });

  it("한글 제목 → 한글 유지", () => {
    expect(generateSlug("쿠버네티스 디버깅")).toBe("쿠버네티스-디버깅");
  });

  it("특수문자 제거", () => {
    expect(generateSlug("Hello! @World# $Test%")).toBe("hello-world-test");
  });

  it("연속 공백/하이픈 → 하이픈 1개", () => {
    expect(generateSlug("hello   world---test")).toBe("hello-world-test");
  });

  it("앞뒤 하이픈 제거", () => {
    expect(generateSlug("  -hello world-  ")).toBe("hello-world");
  });

  it("200자 초과 시 잘림", () => {
    const long = "a".repeat(300);
    expect(generateSlug(long).length).toBeLessThanOrEqual(200);
  });
});
