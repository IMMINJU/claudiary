import { test, expect } from "@playwright/test";

test.describe("랜딩 페이지", () => {
  test("/ 접근 시 로케일 감지 후 랜딩 표시", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/(ko|en)$/);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("ko 랜딩 — 한국어 텍스트 표시", async ({ page }) => {
    await page.goto("/ko");
    await expect(page.locator("h1")).toContainText("Claude Code 대화를 블로그로");
    await expect(page.locator("text=Claude Code").first()).toBeVisible();
    await expect(page.locator("text=어떻게 동작하나요")).toBeVisible();
  });

  test("en 랜딩 — 영어 텍스트 표시", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("h1")).toContainText("Turn Claude Code conversations into blog posts");
    await expect(page.locator("text=Claude Code").first()).toBeVisible();
    await expect(page.locator("text=How it works")).toBeVisible();
  });

  test("언어 전환 (ko → en)", async ({ page }) => {
    await page.goto("/ko");
    await page.click("text=EN");
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator("h1")).toContainText("Turn Claude Code");
  });

  test("언어 전환 (en → ko)", async ({ page }) => {
    await page.goto("/en");
    await page.click("text=한국어");
    await expect(page).toHaveURL(/\/ko$/);
    await expect(page.locator("h1")).toContainText("Claude Code 대화를");
  });

  test("히어로 데모 — /blog 클릭 시 블로그 생성", async ({ page }) => {
    await page.goto("/ko");
    // 대화가 로드될 때까지 대기
    await expect(page.locator("button:has-text('Submit')")).toBeVisible({ timeout: 20000 });
    // /blog Submit 클릭
    await page.click("button:has-text('Submit')");
    // 블로그 글이 나타나는지 확인
    await expect(page.locator("text=조용한 실패")).toBeVisible({ timeout: 10000 });
  });

  test("프라이버시 문구 표시", async ({ page }) => {
    await page.goto("/ko");
    await expect(page.locator("text=원본 대화는 서버에 저장하지 않습니다")).toBeVisible();
  });
});
