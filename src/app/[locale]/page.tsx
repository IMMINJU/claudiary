"use client";

import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageToggle } from "@/components/language-toggle";
import { HeroDemo } from "@/components/landing/hero-demo";

export default function Home() {
  const t = useTranslations("landing");
  const tc = useTranslations("common");
  const pathname = usePathname();
  const locale = pathname.split("/")[1];

  function handleLogin() {
    signIn("github", { callbackUrl: `/${locale}/dashboard` });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4">
        <span className="text-lg font-bold text-foreground">{tc("appName")}</span>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <button
            onClick={handleLogin}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            {tc("login")}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-8 pb-16 pt-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            {t("hero")}
          </h1>
          <p className="mt-3 text-muted-foreground">
            {t("heroDescription")}
          </p>
        </div>

        <HeroDemo
          conversationLabel="Claude Code"
          blogLabel="Blog Post"
          chatMessages={[
            { role: "user", text: t("chat1User") },
            { role: "claude", text: t("chat1Claude") },
            { role: "user", text: t("chat2User") },
            { role: "claude", text: t("chat2Claude") },
            { role: "user", text: t("chat3User") },
            { role: "claude", text: t("chat3Claude") },
            { role: "user", text: t("chat4User") },
          ]}
          blogTitle={t("demoBlogTitle")}
          blogContent={t("demoBlogContent")}
          ctaText={t("ctaText")}
          onLogin={handleLogin}
        />
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-8 py-20">
        <h2 className="mb-10 text-center text-2xl font-bold text-foreground">
          {t("howItWorks")}
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {(["step1", "step2", "step3"] as const).map((step, i) => (
            <Card key={step}>
              <CardContent className="px-6 py-8">
                <div className="mb-4 flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <h3 className="mb-2 text-base font-semibold text-foreground">
                  {t(`${step}Title`)}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t(`${step}Description`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-8 py-8 text-center">
        <p className="text-sm text-muted-foreground">{t("privacy")}</p>
      </footer>
    </div>
  );
}
