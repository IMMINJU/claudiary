import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { users, posts } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { renderMarkdown } from "@/lib/markdown";
import { POST_STATUS } from "@/lib/constants";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; postSlug: string }>;
}): Promise<Metadata> {
  const { username, postSlug: rawPostSlug } = await params;
  const postSlug = decodeURIComponent(rawPostSlug);

  const [user] = await db
    .select({ id: users.id, blogTitle: users.blogTitle })
    .from(users)
    .where(eq(users.blogSlug, username))
    .limit(1);

  if (!user) return {};

  const [post] = await db
    .select({ title: posts.title, excerpt: posts.excerpt })
    .from(posts)
    .where(
      and(eq(posts.userId, user.id), eq(posts.slug, postSlug), eq(posts.status, POST_STATUS.PUBLISHED)),
    )
    .limit(1);

  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt || `${post.title} — ${user.blogTitle || username}`,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      type: "article",
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ locale: string; username: string; postSlug: string }>;
}) {
  const { username, postSlug: rawPostSlug } = await params;
  const postSlug = decodeURIComponent(rawPostSlug);

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.blogSlug, username))
    .limit(1);

  if (!user) notFound();

  const [post] = await db
    .select()
    .from(posts)
    .where(
      and(
        eq(posts.userId, user.id),
        eq(posts.slug, postSlug),
        eq(posts.status, POST_STATUS.PUBLISHED),
      ),
    )
    .limit(1);

  if (!post) notFound();

  const html = await renderMarkdown(post.content);

  return (
    <article className="mx-auto max-w-2xl px-6 py-16">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{post.title}</h1>
        <div className="mt-3 flex items-center gap-3">
          {post.publishedAt && (
            <time className="text-sm text-muted-foreground">
              {new Date(post.publishedAt).toLocaleDateString()}
            </time>
          )}
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
      </header>
      <div
        className="prose prose-neutral max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
