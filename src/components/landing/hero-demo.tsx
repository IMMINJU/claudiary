"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ChatMessage {
  role: "user" | "claude";
  text: string;
}

interface HeroDemoProps {
  conversationLabel: string;
  blogLabel: string;
  chatMessages: ChatMessage[];
  blogTitle: string;
  blogContent: string;
  ctaText: string;
  onLogin: () => void;
}

export function HeroDemo({
  conversationLabel,
  blogLabel,
  chatMessages,
  blogTitle,
  blogContent,
  ctaText,
  onLogin,
}: HeroDemoProps) {
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [blogTriggered, setBlogTriggered] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [showBlog, setShowBlog] = useState(false);
  const [showCta, setShowCta] = useState(false);

  // 대화 메시지 순차 표시
  useEffect(() => {
    if (visibleMessages < chatMessages.length) {
      const delay = visibleMessages === 0 ? 600 : 1200;
      const timer = setTimeout(() => setVisibleMessages((v) => v + 1), delay);
      return () => clearTimeout(timer);
    }
  }, [visibleMessages, chatMessages.length]);

  // /blog 버튼 클릭 → 분석 → 블로그 → CTA
  useEffect(() => {
    if (!blogTriggered) return;
    setAnalyzing(true);
    const t1 = setTimeout(() => {
      setAnalyzing(false);
      setShowBlog(true);
    }, 2000);
    const t2 = setTimeout(() => setShowCta(true), 8000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [blogTriggered]);

  const allMessagesShown = visibleMessages >= chatMessages.length;

  return (
    <div className="space-y-8">
      {/* 메인 데모 영역 */}
      <div
        className={`mx-auto transition-all duration-700 ease-in-out ${
          showBlog ? "grid grid-cols-1 gap-6 md:grid-cols-2" : "max-w-3xl"
        }`}
      >
        {/* 터미널 */}
        <div className="rounded-xl border border-border bg-card shadow-sm transition-all duration-700">
          {/* 타이틀바 */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <div className="flex gap-1.5">
              <span className="size-3 rounded-full bg-destructive/40" />
              <span className="size-3 rounded-full bg-[oklch(0.75_0.15_85)]" />
              <span className="size-3 rounded-full bg-[oklch(0.7_0.15_145)]" />
            </div>
            <Badge variant="outline" className="ml-2 text-xs">
              {conversationLabel}
            </Badge>
          </div>

          {/* 대화 내용 */}
          <div className="space-y-3 p-5 min-h-[320px]">
            {chatMessages.slice(0, visibleMessages).map((msg, i) => (
              <div
                key={i}
                className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500"
              >
                <div
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    msg.role === "user"
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {msg.role === "user" ? "U" : "C"}
                </div>
                <div
                  className={`rounded-lg px-3 py-2 ${
                    msg.role === "user" ? "bg-muted" : "border border-border"
                  }`}
                >
                  <div className="font-mono text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}

            {/* 타이핑 인디케이터 */}
            {!allMessagesShown && (
              <div className="flex gap-3">
                <div
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    chatMessages[visibleMessages].role === "user"
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {chatMessages[visibleMessages].role === "user" ? "U" : "C"}
                </div>
                <div className="rounded-lg bg-muted px-3 py-2">
                  <span className="inline-flex gap-1">
                    <span className="size-1.5 rounded-full bg-muted-foreground/40 animate-bounce" />
                    <span className="size-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0.15s]" />
                    <span className="size-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0.3s]" />
                  </span>
                </div>
              </div>
            )}

            {/* /blog 입력 + 제출 버튼 */}
            {allMessagesShown && !blogTriggered && (
              <div className="pt-3 animate-in fade-in duration-500">
                <div className="flex items-center gap-2 rounded-lg bg-muted p-2">
                  <div className="flex-1 px-2 font-mono text-base text-foreground">
                    <span className="text-primary font-semibold">/blog</span>
                    <span className="ml-0.5 inline-block h-5 w-[2px] bg-primary animate-[blink_1s_steps(1)_infinite] align-text-bottom" />
                  </div>
                  <button
                    onClick={() => setBlogTriggered(true)}
                    className="shimmer-btn shrink-0 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all hover:shadow-[0_0_24px_oklch(0.62_0.16_45/0.4)] cursor-pointer"
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}

            {/* 분석 중 */}
            {analyzing && (
              <div className="flex gap-3 animate-in fade-in duration-500">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  C
                </div>
                <div className="rounded-lg border border-border px-3 py-2">
                  <div className="font-mono text-sm text-muted-foreground">
                    analyzing 3 sessions, 847 messages...
                    <br />
                    found 2 blog-worthy topics. generating...
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 블로그 카드 */}
        {showBlog && (
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="mb-4">
              <Badge className="text-xs">{blogLabel}</Badge>
            </div>

            <article className="space-y-3">
              <h3 className="text-xl font-bold text-foreground">{blogTitle}</h3>
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-xs">#google-apps-script</Badge>
                <Badge variant="secondary" className="text-xs">#debugging</Badge>
              </div>
              <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                {blogContent.split("\n").map((line, i) => {
                  if (line.startsWith("> ")) {
                    return (
                      <blockquote
                        key={i}
                        className="border-l-2 border-primary/40 pl-3 italic text-foreground/70"
                      >
                        {line.slice(2)}
                      </blockquote>
                    );
                  }
                  if (line === "") return <div key={i} className="h-1" />;
                  return <p key={i}>{line}</p>;
                })}
              </div>
              <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                <span className="inline-block size-2 rounded-full bg-primary/60" />
                Published just now
              </div>
            </article>
          </div>
        )}
      </div>

      {/* CTA 버튼 */}
      {showCta && (
        <div className="flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Button
            size="lg"
            className="shimmer-btn gap-3 rounded-full px-12 py-7 text-lg"
            onClick={onLogin}
          >
            <svg className="size-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            {ctaText}
          </Button>
        </div>
      )}
    </div>
  );
}
