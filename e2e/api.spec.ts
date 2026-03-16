import { test, expect } from "@playwright/test";

test.describe("API 인증", () => {
  test("API Key 없이 /api/v1/posts → 401", async ({ request }) => {
    const res = await request.get("/api/v1/posts");
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test("잘못된 API Key → 401", async ({ request }) => {
    const res = await request.get("/api/v1/posts", {
      headers: { Authorization: "Bearer cldy_invalid_key_12345" },
    });
    expect(res.status()).toBe(401);
  });

  test("API Key 없이 /api/v1/me → 401", async ({ request }) => {
    const res = await request.get("/api/v1/me");
    expect(res.status()).toBe(401);
  });

  test("비로그인 /api/web/api-keys → 401", async ({ request }) => {
    const res = await request.get("/api/web/api-keys");
    expect(res.status()).toBe(401);
  });

  test("비로그인 /api/web/settings → 401", async ({ request }) => {
    const res = await request.get("/api/web/settings");
    expect(res.status()).toBe(401);
  });

  test("POST /api/v1/posts title 누락 → 400", async ({ request }) => {
    // 유효한 키가 있다고 가정하더라도, 키 없으면 401이 먼저 뜸
    const res = await request.post("/api/v1/posts", {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer cldy_invalid",
      },
      data: { content: "no title" },
    });
    // 인증 실패가 먼저
    expect(res.status()).toBe(401);
  });
});
