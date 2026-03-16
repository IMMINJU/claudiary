import { test, expect, devices } from "@playwright/test";
import fs from "fs";

const authStateExists = fs.existsSync("e2e/auth-state.json");

test.use({ ...devices["iPhone 14"] });

test.describe("모바일 — 비로그인", () => {
  test("랜딩 — 히어로 텍스트 + 로그인 버튼 표시", async ({ page }) => {
    await page.goto("/ko");
    await expect(page.locator("h1")).toContainText("Claude Code 대화를 블로그로");
    await expect(page.locator("text=로그인")).toBeVisible();
  });

  test("랜딩 — 언어 전환", async ({ page }) => {
    await page.goto("/ko");
    await page.click("text=EN");
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator("h1")).toContainText("Turn Claude Code");
  });

  test("로그인 페이지 — GitHub 버튼 표시", async ({ page }) => {
    await page.goto("/ko/login");
    await expect(page.locator("text=GitHub으로 로그인")).toBeVisible();
  });

  test("비로그인 /dashboard → /login 리다이렉트", async ({ page }) => {
    await page.goto("/ko/dashboard");
    await expect(page).toHaveURL(/\/ko\/login/);
  });

  test("퍼블릭 블로그 — 글 목록 표시", async ({ page }) => {
    const res = await page.goto("/ko/blog/bbang");
    if (res?.status() === 200) {
      await expect(page.locator("h1")).toBeVisible();
    }
  });

  test("퍼블릭 블로그 — 글 상세 페이지", async ({ page }) => {
    const res = await page.goto("/ko/blog/bbang");
    if (res?.status() === 200) {
      // 첫 번째 글 클릭
      const firstLink = page.locator("a[href*='/blog/bbang/']").first();
      if (await firstLink.isVisible()) {
        await firstLink.click();
        await expect(page.locator("article")).toBeVisible();
      }
    }
  });
});

test.describe("모바일 — 인증", () => {
  test.use({ storageState: authStateExists ? "e2e/auth-state.json" : undefined });
  if (!authStateExists) test.skip();

  test("대시보드 접근 가능", async ({ page }) => {
    await page.goto("/ko/dashboard");
    await expect(page.locator("h1")).toContainText("내 글");
  });

  test("대시보드 — 검색 동작", async ({ page }) => {
    await page.goto("/ko/dashboard");
    await page.fill('input[placeholder="Search..."]', "Docker");
    await expect(page.locator("text=Docker 컨테이너가 10초만에 죽는 이유")).toBeVisible();
  });

  test("대시보드 — 상태 필터", async ({ page }) => {
    await page.goto("/ko/dashboard");
    const allCount = await page.locator("a[href*='/dashboard/posts/']").count();
    await page.click("button:has-text('Published')");
    const publishedCount = await page.locator("a[href*='/dashboard/posts/']").count();
    expect(publishedCount).toBeLessThan(allCount);
  });

  test("글 편집 페이지 진입", async ({ page }) => {
    await page.goto("/ko/dashboard");
    await page.locator("a[href*='/dashboard/posts/']").first().click();
    await expect(page.locator("text=글 편집")).toBeVisible();
  });

  test("API Keys 페이지", async ({ page }) => {
    await page.goto("/ko/dashboard/api-keys");
    await expect(page.locator("h1")).toContainText("API Keys");
  });

  test("블로그 설정 페이지", async ({ page }) => {
    await page.goto("/ko/dashboard/settings");
    await expect(page.locator("text=블로그 프로필")).toBeVisible();
  });
});
