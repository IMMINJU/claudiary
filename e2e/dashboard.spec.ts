import { test, expect } from "@playwright/test";
import fs from "fs";

const authStateExists = fs.existsSync("e2e/auth-state.json");

// CI에서 auth-state.json이 없으면 스킵
test.use({ storageState: authStateExists ? "e2e/auth-state.json" : undefined });
if (!authStateExists) test.skip();

test.describe("대시보드", () => {
  test("로그인 상태에서 대시보드 접근 가능", async ({ page }) => {
    await page.goto("/ko/dashboard");
    await expect(page.locator("h1")).toContainText("내 글");
  });

  test("사이드바 — 내 글, API Keys, 블로그 설정, 내 블로그 링크", async ({ page }) => {
    await page.goto("/ko/dashboard");
    await expect(page.locator("text=내 글").first()).toBeVisible();
    await expect(page.locator("text=API Keys")).toBeVisible();
    await expect(page.locator("text=블로그 설정")).toBeVisible();
    await expect(page.locator("text=내 블로그")).toBeVisible();
  });

  test("글 목록 — 뷰 전환 (List → Card → Calendar)", async ({ page }) => {
    await page.goto("/ko/dashboard");
    // 기본 List 뷰
    await expect(page.locator("h1")).toContainText("내 글");

    // Card 뷰 전환
    await page.locator("button").filter({ has: page.locator("svg.lucide-layout-grid") }).click();
    // Card 뷰에서는 grid가 보여야 함
    await expect(page.locator(".grid.sm\\:grid-cols-2")).toBeVisible();

    // Calendar 뷰 전환
    await page.locator("button").filter({ has: page.locator("svg.lucide-calendar") }).click();
    await expect(page.locator("text=Sun")).toBeVisible();
  });

  test("글 목록 — 검색", async ({ page }) => {
    await page.goto("/ko/dashboard");
    await page.fill('input[placeholder="Search..."]', "Docker");
    await expect(page.locator("text=Docker 컨테이너가 10초만에 죽는 이유")).toBeVisible();
    // 관련 없는 글은 안 보여야 함
    await expect(page.locator("text=CORS 삽질")).not.toBeVisible();
  });

  test("글 목록 — 상태 필터", async ({ page }) => {
    await page.goto("/ko/dashboard");
    const allCount = await page.locator("a[href*='/dashboard/posts/']").count();
    await page.click("button:has-text('Published')");
    const publishedCount = await page.locator("a[href*='/dashboard/posts/']").count();
    expect(publishedCount).toBeLessThan(allCount);
    expect(publishedCount).toBeGreaterThan(0);
  });

  test("글 편집 페이지 진입", async ({ page }) => {
    await page.goto("/ko/dashboard");
    await page.locator("a[href*='/dashboard/posts/']").first().click();
    await expect(page.locator("text=글 편집")).toBeVisible();
    await expect(page.locator("text=Markdown")).toBeVisible();
    await expect(page.locator("text=미리보기")).toBeVisible();
  });

  test("글 편집 — 제목 수정 후 저장", async ({ page }) => {
    await page.goto("/ko/dashboard");
    await page.locator("a[href*='/dashboard/posts/']").first().click();
    await expect(page.locator("text=글 편집")).toBeVisible();

    // 제목 수정
    const titleInput = page.locator("input#title");
    const original = await titleInput.inputValue();
    await titleInput.fill(original + " (edited)");

    // 저장
    await page.click("button:has-text('저장')");
    await page.waitForTimeout(1000);

    // 새로고침 후 반영 확인
    await page.reload();
    await expect(page.locator("input#title")).toHaveValue(original + " (edited)");

    // 원복
    await page.locator("input#title").fill(original);
    await page.click("button:has-text('저장')");
  });

  test("글 편집 — 상태 변경 (publish/unpublish)", async ({ page }) => {
    await page.goto("/ko/dashboard");
    // draft 글 찾기
    await page.click("button:has-text('Draft')");
    await page.locator("a[href*='/dashboard/posts/']").first().click();
    await expect(page.locator("text=글 편집")).toBeVisible();

    // publish
    await page.click("button:has-text('공개')");
    await expect(page.locator("text=공개").first()).toBeVisible();

    // unpublish (원복)
    await page.click("button:has-text('비공개로')");
    await expect(page.locator("text=초안").first()).toBeVisible();
  });

  test("API Keys 페이지 접근", async ({ page }) => {
    await page.goto("/ko/dashboard/api-keys");
    await expect(page.locator("h1")).toContainText("API Keys");
    await expect(page.locator("text=API Key 생성")).toBeVisible();
  });

  test("블로그 설정 페이지 접근", async ({ page }) => {
    await page.goto("/ko/dashboard/settings");
    await expect(page.locator("h1")).toContainText("블로그 설정");
    await expect(page.locator("text=블로그 프로필")).toBeVisible();
  });

  test("설정 페이지 — 언어 전환", async ({ page }) => {
    await page.goto("/ko/dashboard/settings");
    await page.click("text=English");
    await expect(page).toHaveURL(/\/en\/dashboard\/settings/);
    await expect(page.locator("h1")).toContainText("Blog Settings");
  });
});
