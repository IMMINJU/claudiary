import { eq, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { getTranslations } from "next-intl/server";
import { PostList } from "@/components/dashboard/post-list";

export default async function DashboardPage() {
  const session = await auth();
  const t = await getTranslations("dashboard");

  const userPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      status: posts.status,
      tags: posts.tags,
      createdAt: posts.createdAt,
      publishedAt: posts.publishedAt,
    })
    .from(posts)
    .where(eq(posts.userId, session!.user!.id!))
    .orderBy(desc(posts.createdAt));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">{t("myPosts")}</h1>
      <PostList
        posts={userPosts}
        emptyTitle={t("noPosts")}
        emptyDescription={t("noPostsDescription")}
      />
    </div>
  );
}
