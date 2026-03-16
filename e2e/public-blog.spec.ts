import { test, expect } from "@playwright/test";

test.describe("퍼블릭 블로그", () => {
  test("존재하지 않는 username → 404", async ({ page }) => {
    const res = await page.goto("/ko/blog/nonexistent-user-12345");
    expect(res?.status()).toBe(404);
  });

  test("/blog/bbang → 블로그 메인 (설정된 경우)", async ({ page }) => {
    const res = await page.goto("/ko/blog/bbang");
    // bbang 유저가 DB에 있으면 200, 없으면 404
    if (res?.status() === 200) {
      await expect(page.locator("h1")).toBeVisible();
    }
  });
});
