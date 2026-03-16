import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { requireSession } from "@/lib/auth/session";
import { successResponse, errorResponse } from "@/lib/api-response";

/** DELETE /api/web/api-keys/:id */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const [session, error] = await requireSession();
  if (error) return error;

  const { id } = await params;

  const deleted = await db
    .delete(apiKeys)
    .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, session.user.id)))
    .returning({ id: apiKeys.id });

  if (deleted.length === 0) {
    return errorResponse("API key not found", 404);
  }

  return successResponse({ id: deleted[0].id });
}
