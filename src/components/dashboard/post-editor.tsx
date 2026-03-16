"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { POST_STATUS } from "@/lib/constants";
import { Trash2 } from "lucide-react";
import type { Post } from "@/types";

export function PostEditor({ post }: { post: Post }) {
  const router = useRouter();
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [slug, setSlug] = useState(post.slug);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(post.status);
  const [previewHtml, setPreviewHtml] = useState("");

  // remark/rehype로 프리뷰 렌더링
  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        const { renderMarkdown } = await import("@/lib/markdown");
        const html = await renderMarkdown(content);
        setPreviewHtml(html);
      } catch {
        setPreviewHtml(`<p>${content}</p>`);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [content]);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/web/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, slug }),
    });
    setSaving(false);
  }

  async function handleToggleStatus() {
    const newStatus =
      status === POST_STATUS.PUBLISHED ? POST_STATUS.DRAFT : POST_STATUS.PUBLISHED;
    const res = await fetch(`/api/web/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) setStatus(newStatus);
  }

  async function handleDelete() {
    if (!confirm(t("deleteConfirm"))) return;
    await fetch(`/api/web/posts/${post.id}`, { method: "DELETE" });
    router.push("../../");
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">{t("editPost")}</h1>
          <Badge variant={status === POST_STATUS.PUBLISHED ? "default" : "outline"}>
            {status === POST_STATUS.PUBLISHED ? tc("publish") : tc("draft")}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleToggleStatus}>
            {status === POST_STATUS.PUBLISHED ? t("unpublish") : tc("publish")}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? t("saving") : tc("save")}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDelete}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* 메타 필드 */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="title">{t("title")}</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="slug">{t("slug")}</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="font-mono text-sm"
          />
        </div>
      </div>

      {/* 에디터 + 프리뷰 */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="content">{t("markdown")}</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[500px] font-mono text-sm"
          />
        </div>
        <div className="grid gap-2">
          <Label>{t("preview")}</Label>
          <div className="min-h-[500px] rounded-lg border border-border p-6">
            <div
              className="prose prose-neutral max-w-none"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
