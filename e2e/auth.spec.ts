import { test, expect } from "@playwright/test";

test.describe("인증", () => {
  test("비로그인 /dashboard → /login 리다이렉트", async ({ page }) => {
    await page.goto("/ko/dashboard");
    await expect(page).toHaveURL(/\/ko\/login/);
  });

  test("로그인 페이지에 GitHub 버튼 표시", async ({ page }) => {
    await page.goto("/ko/login");
    await expect(page.locator("text=GitHub으로 로그인")).toBeVisible();
  });

  test("/api/auth/providers → GitHub 프로바이더 반환", async ({ request }) => {
    const res = await request.get("/api/auth/providers");
    const body = await res.json();
    expect(body.github).toBeDefined();
    expect(body.github.id).toBe("github");
  });
});
