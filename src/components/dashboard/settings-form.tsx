"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface SettingsFormProps {
  initialData: {
    blogSlug: string;
    blogTitle: string;
    blogDescription: string;
  };
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = pathname.split("/")[1];
  const [data, setData] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/web/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{t("blogProfile")}</h2>
      </div>

      <Separator />

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="blogSlug">{t("blogUrlSlug")}</Label>
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-sm text-muted-foreground">claudiary.com/blog/</span>
            <Input
              id="blogSlug"
              value={data.blogSlug}
              onChange={(e) => setData({ ...data, blogSlug: e.target.value })}
              placeholder="my-blog"
              className="max-w-xs"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="blogTitle">{t("blogTitleLabel")}</Label>
          <Input
            id="blogTitle"
            value={data.blogTitle}
            onChange={(e) => setData({ ...data, blogTitle: e.target.value })}
            className="max-w-md"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="blogDescription">{t("description")}</Label>
          <Textarea
            id="blogDescription"
            value={data.blogDescription}
            onChange={(e) => setData({ ...data, blogDescription: e.target.value })}
            rows={4}
            className="max-w-md"
          />
        </div>
      </div>

      <Separator />

      <Button onClick={handleSave} disabled={saving}>
        {saving ? t("saving") : saved ? t("saved") : tc("save")}
      </Button>

      <Separator />

      <div>
        <h2 className="text-lg font-semibold text-foreground">{tc("settings")}</h2>
      </div>

      <div className="grid gap-2">
        <Label>Language</Label>
        <div className="flex gap-2">
          {(["ko", "en"] as const).map((lang) => (
            <Button
              key={lang}
              variant={currentLocale === lang ? "secondary" : "outline"}
              size="sm"
              onClick={() => {
                const newPath = pathname.replace(`/${currentLocale}`, `/${lang}`);
                router.push(newPath);
              }}
            >
              {lang === "ko" ? "한국어" : "English"}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
