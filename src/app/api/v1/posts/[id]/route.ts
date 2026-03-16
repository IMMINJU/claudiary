import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { requireApiKey } from "@/lib/auth/verify-api-key";
import { successResponse, errorResponse } from "@/lib/api-response";
import { updatePostSchema } from "@/lib/validations/post";
import { POST_STATUS } from "@/lib/constants";

type Params = { params: Promise<{ id: string }> };

/** GET /api/v1/posts/:id */
export async function GET(req: NextRequest, { params }: Params) {
  const [user, error] = await requireApiKey(req);
  if (error) return error;

  const { id } = await params;

  const result = await db
    .select()
    .from(posts)
    .where(and(eq(posts.id, id), eq(posts.userId, user.id)))
    .limit(1);

  if (result.length === 0) {
    return errorResponse("Post not found", 404);
  }

  return successResponse(result[0]);
}

/** PATCH /api/v1/posts/:id */
export async function PATCH(req: NextRequest, { params }: Params) {
  const [user, error] = await requireApiKey(req);
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

  // published로 변경 시 publishedAt 자동 설정
  if (parsed.data.status === POST_STATUS.PUBLISHED) {
    updates.publishedAt = new Date();
  }

  const result = await db
    .update(posts)
    .set(updates)
    .where(and(eq(posts.id, id), eq(posts.userId, user.id)))
    .returning();

  if (result.length === 0) {
    return errorResponse("Post not found", 404);
  }

  return successResponse(result[0]);
}

/** DELETE /api/v1/posts/:id */
export async function DELETE(req: NextRequest, { params }: Params) {
  const [user, error] = await requireApiKey(req);
  if (error) return error;

  const { id } = await params;

  const result = await db
    .delete(posts)
    .where(and(eq(posts.id, id), eq(posts.userId, user.id)))
    .returning({ id: posts.id });

  if (result.length === 0) {
    return errorResponse("Post not found", 404);
  }

  return successResponse({ id: result[0].id });
}
