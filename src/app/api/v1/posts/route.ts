import { NextRequest } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { requireApiKey } from "@/lib/auth/verify-api-key";
import { successResponse, errorResponse } from "@/lib/api-response";
import { createPostSchema } from "@/lib/validations/post";
import { generateSlug } from "@/lib/slug";
import { POST_STATUS, POST_SOURCE } from "@/lib/constants";

/** GET /api/v1/posts — 목록 */
export async function GET(req: NextRequest) {
  const [user, error] = await requireApiKey(req);
  if (error) return error;

  const status = req.nextUrl.searchParams.get("status");

  const conditions = [eq(posts.userId, user.id)];
  if (status === POST_STATUS.DRAFT || status === POST_STATUS.PUBLISHED) {
    conditions.push(eq(posts.status, status));
  }

  const result = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      status: posts.status,
      tags: posts.tags,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .where(and(...conditions))
    .orderBy(desc(posts.createdAt));

  return successResponse(result);
}

/** POST /api/v1/posts — 생성 (conversationId로 upsert) */
export async function POST(req: NextRequest) {
  const [user, error] = await requireApiKey(req);
  if (error) return error;

  const body = await req.json();
  const parsed = createPostSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0].message, 400);
  }

  const { title, content, excerpt, tags, conversationId, slug } = parsed.data;
  const postSlug = slug || generateSlug(title);

  // conversationId가 있으면 upsert
  if (conversationId) {
    const existing = await db
      .select({ id: posts.id })
      .from(posts)
      .where(
        and(
          eq(posts.userId, user.id),
          eq(posts.conversationId, conversationId),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      const [updated] = await db
        .update(posts)
        .set({ title, content, excerpt, tags, slug: postSlug, updatedAt: new Date() })
        .where(eq(posts.id, existing[0].id))
        .returning();
      return successResponse(updated);
    }
  }

  const [created] = await db
    .insert(posts)
    .values({
      userId: user.id,
      title,
      slug: postSlug,
      content,
      excerpt: excerpt ?? null,
      tags,
      conversationId: conversationId ?? null,
      source: POST_SOURCE.SKILL,
    })
    .returning();

  return successResponse(created, 201);
}
