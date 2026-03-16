"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { POST_STATUS } from "@/lib/constants";
import { List, LayoutGrid, Calendar, Search, X } from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  status: string;
  tags: string[];
  createdAt: Date;
  publishedAt: Date | null;
}

interface PostListProps {
  posts: Post[];
  emptyTitle: string;
  emptyDescription: string;
}

type ViewMode = "list" | "card" | "calendar";
type StatusFilter = "all" | "draft" | "published";

function groupByDate(posts: Post[]): Record<string, Post[]> {
  const groups: Record<string, Post[]> = {};
  for (const post of posts) {
    const date = new Date(post.createdAt).toISOString().split("T")[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(post);
  }
  return groups;
}

function getCalendarDays(posts: Post[]) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const postsByDay: Record<number, Post[]> = {};
  for (const post of posts) {
    const d = new Date(post.createdAt);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!postsByDay[day]) postsByDay[day] = [];
      postsByDay[day].push(post);
    }
  }

  return { year, month, firstDay, daysInMonth, postsByDay };
}

export function PostList({ posts, emptyTitle, emptyDescription }: PostListProps) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const [view, setView] = useState<ViewMode>("list");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // 전체 태그 목록 (빈도순)
  const allTags = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const post of posts) {
      for (const tag of post.tags) {
        counts[tag] = (counts[tag] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  }, [posts]);

  // 필터 적용
  const filtered = useMemo(() => {
    let result = posts;
    if (filter !== "all") result = result.filter((p) => p.status === filter);
    if (selectedTag) result = result.filter((p) => p.tags.includes(selectedTag));
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [posts, filter, selectedTag, search]);

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-lg font-medium text-foreground">{emptyTitle}</p>
          <p className="mt-2 text-sm text-muted-foreground">{emptyDescription}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 툴바 */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant={filter === "all" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All ({posts.length})
            </Button>
            <Button
              variant={filter === "published" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter("published")}
            >
              Published ({posts.filter((p) => p.status === POST_STATUS.PUBLISHED).length})
            </Button>
            <Button
              variant={filter === "draft" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter("draft")}
            >
              Draft ({posts.filter((p) => p.status === POST_STATUS.DRAFT).length})
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="h-8 w-48 pl-8 text-sm"
              />
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
              {([
                { mode: "list" as const, icon: List },
                { mode: "card" as const, icon: LayoutGrid },
                { mode: "calendar" as const, icon: Calendar },
              ]).map(({ mode, icon: Icon }) => (
                <Button
                  key={mode}
                  variant={view === mode ? "secondary" : "ghost"}
                  size="icon-sm"
                  onClick={() => setView(mode)}
                >
                  <Icon className="size-4" />
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* 태그 필터 */}
        <div className="flex flex-wrap items-center gap-1.5">
          {selectedTag && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setSelectedTag(null)}
              className="gap-1 text-xs"
            >
              <X className="size-3" />
              Clear
            </Button>
          )}
          {allTags.slice(0, 12).map(({ tag, count }) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`rounded-full px-2.5 py-0.5 text-xs transition-colors ${
                selectedTag === tag
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              #{tag} <span className="ml-0.5 opacity-60">{count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 결과 카운트 */}
      {(search || selectedTag) && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} results
        </p>
      )}

      {/* 뷰 */}
      {view === "list" && <ListView posts={filtered} locale={locale} />}
      {view === "card" && <CardView posts={filtered} locale={locale} />}
      {view === "calendar" && <CalendarView posts={filtered} locale={locale} />}
    </div>
  );
}

function ListView({ posts, locale }: { posts: Post[]; locale: string }) {
  const grouped = groupByDate(posts);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([date, datePosts]) => (
        <div key={date}>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {date}
          </h3>
          <div className="divide-y divide-border rounded-lg border border-border">
            {datePosts.map((post) => (
              <Link
                key={post.id}
                href={`/${locale}/dashboard/posts/${post.id}/edit`}
                className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-accent"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`size-2 shrink-0 rounded-full ${
                      post.status === POST_STATUS.PUBLISHED
                        ? "bg-primary"
                        : "bg-muted-foreground/30"
                    }`}
                  />
                  <span className="truncate text-sm font-medium text-foreground">
                    {post.title}
                  </span>
                  <div className="hidden gap-1.5 sm:flex">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs text-muted-foreground">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <Badge
                  variant={post.status === POST_STATUS.PUBLISHED ? "default" : "outline"}
                  className="shrink-0 text-xs"
                >
                  {post.status}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function CardView({ posts, locale }: { posts: Post[]; locale: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <Link key={post.id} href={`/${locale}/dashboard/posts/${post.id}/edit`}>
          <Card className="h-full transition-colors hover:bg-accent">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <span
                  className={`size-2 rounded-full ${
                    post.status === POST_STATUS.PUBLISHED
                      ? "bg-primary"
                      : "bg-muted-foreground/30"
                  }`}
                />
                <span className="text-xs text-muted-foreground">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="mb-2 text-sm font-semibold text-foreground line-clamp-2">
                {post.title}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-xs text-muted-foreground">
                    #{tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function CalendarView({ posts, locale }: { posts: Post[]; locale: string }) {
  const { year, month, firstDay, daysInMonth, postsByDay } = getCalendarDays(posts);
  const monthName = new Date(year, month).toLocaleString("default", { month: "long", year: "numeric" });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div>
      <h3 className="mb-4 text-sm font-medium text-foreground">{monthName}</h3>
      <div className="grid grid-cols-7 gap-px rounded-lg border border-border bg-border overflow-hidden">
        {weekDays.map((d) => (
          <div key={d} className="bg-muted px-2 py-2 text-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-card min-h-[80px]" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayPosts = postsByDay[day] || [];
          return (
            <div key={day} className="bg-card p-2 min-h-[80px]">
              <span className="text-xs text-muted-foreground">{day}</span>
              <div className="mt-1 space-y-0.5">
                {dayPosts.slice(0, 3).map((post) => (
                  <Link
                    key={post.id}
                    href={`/${locale}/dashboard/posts/${post.id}/edit`}
                    className="block truncate rounded px-1 py-0.5 text-[10px] leading-tight transition-colors hover:bg-accent"
                  >
                    <span
                      className={`mr-1 inline-block size-1.5 rounded-full align-middle ${
                        post.status === POST_STATUS.PUBLISHED
                          ? "bg-primary"
                          : "bg-muted-foreground/30"
                      }`}
                    />
                    {post.title}
                  </Link>
                ))}
                {dayPosts.length > 3 && (
                  <span className="block px-1 text-[10px] text-muted-foreground">
                    +{dayPosts.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
