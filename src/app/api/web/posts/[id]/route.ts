import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { requireSession } from "@/lib/auth/session";
import { successResponse, errorResponse } from "@/lib/api-response";
import { updatePostSchema } from "@/lib/validations/post";
import { POST_STATUS } from "@/lib/constants";

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/web/posts/:id */
export async function PATCH(req: NextRequest, { params }: Params) {
  const [session, error] = await requireSession();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = updatePostSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0].message, 400);
  }

  const updates: Record<string, unknown> = {
    ...parsed.data,
    updatedAt: new Date(),
  };

  if (parsed.data.status === POST_STATUS.PUBLISHED) {
    updates.publishedAt = new Date();
  }

  const result = await db
    .update(posts)
    .set(updates)
    .where(and(eq(posts.id, id), eq(posts.userId, session.user.id)))
    .returning();

  if (result.length === 0) {
    return errorResponse("Post not found", 404);
  }

  return successResponse(result[0]);
}

/** DELETE /api/web/posts/:id */
export async function DELETE(req: NextRequest, { params }: Params) {
  const [session, error] = await requireSession();
  if (error) return error;

  const { id } = await params;

  const result = await db
    .delete(posts)
    .where(and(eq(posts.id, id), eq(posts.userId, session.user.id)))
    .returning({ id: posts.id });

  if (result.length === 0) {
    return errorResponse("Post not found", 404);
  }

  return successResponse({ id: result[0].id });
}
