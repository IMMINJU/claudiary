import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { PostEditor } from "@/components/dashboard/post-editor";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  const [post] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.id, id), eq(posts.userId, session!.user!.id!)))
    .limit(1);

  if (!post) notFound();

  return <PostEditor post={post} />;
}
