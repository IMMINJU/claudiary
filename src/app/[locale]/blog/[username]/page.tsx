import { notFound } from "next/navigation";
import Link from "next/link";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/db";
import { users, posts } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { POST_STATUS } from "@/lib/constants";
import { LanguageToggle } from "@/components/language-toggle";

export const revalidate = 60;

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { locale, username } = await params;

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      blogTitle: users.blogTitle,
      blogDescription: users.blogDescription,
    })
    .from(users)
    .where(eq(users.blogSlug, username))
    .limit(1);

  if (!user) notFound();

  const userPosts = await db
    .select({
      title: posts.title,
      slug: posts.slug,
      tags: posts.tags,
      publishedAt: posts.publishedAt,
    })
    .from(posts)
    .where(and(eq(posts.userId, user.id), eq(posts.status, POST_STATUS.PUBLISHED)))
    .orderBy(desc(posts.publishedAt));

  // 날짜별 그룹핑
  const grouped: Record<string, typeof userPosts> = {};
  for (const post of userPosts) {
    const date = post.publishedAt
      ? new Date(post.publishedAt).toISOString().split("T")[0]
      : "Unknown";
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(post);
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-8 flex justify-end">
        <LanguageToggle />
      </div>
      <header className="mb-12">
        <h1 className="text-3xl font-bold text-foreground">
          {user.blogTitle || user.name}
        </h1>
        {user.blogDescription && (
          <p className="mt-2 text-muted-foreground">{user.blogDescription}</p>
        )}
      </header>

      {userPosts.length === 0 ? (
        <p className="text-muted-foreground">No posts yet.</p>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([date, datePosts]) => (
            <div key={date}>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                {date}
              </h2>
              <div className="space-y-3">
                {datePosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/${locale}/blog/${username}/${post.slug}`}
                    className="group block"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {post.title}
                      </span>
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
