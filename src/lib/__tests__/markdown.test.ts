import { describe, it, expect } from "vitest";
import { renderMarkdown } from "../markdown";

describe("renderMarkdown", () => {
  it("# 제목 → <h1>", async () => {
    const html = await renderMarkdown("# Hello");
    expect(html).toContain("<h1>Hello</h1>");
  });

  it("## 제목 → <h2>", async () => {
    const html = await renderMarkdown("## Sub");
    expect(html).toContain("<h2>Sub</h2>");
  });

  it("**굵게** → <strong>", async () => {
    const html = await renderMarkdown("**bold**");
    expect(html).toContain("<strong>bold</strong>");
  });

  it("`코드` → <code>", async () => {
    const html = await renderMarkdown("`code`");
    expect(html).toContain("<code>code</code>");
  });

  it("<script> 태그 → sanitize 제거", async () => {
    const html = await renderMarkdown('<script>alert("xss")</script>');
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("alert");
  });
});
