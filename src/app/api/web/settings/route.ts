import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireSession } from "@/lib/auth/session";
import { successResponse, errorResponse } from "@/lib/api-response";

/** GET /api/web/settings */
export async function GET() {
  const [session, error] = await requireSession();
  if (error) return error;

  const [user] = await db
    .select({
      blogSlug: users.blogSlug,
      blogTitle: users.blogTitle,
      blogDescription: users.blogDescription,
    })
    .from(users)
    .where(eq(users.id, session.user.id));

  return successResponse(user);
}

/** PATCH /api/web/settings */
export async function PATCH(req: NextRequest) {
  const [session, error] = await requireSession();
  if (error) return error;

  const body = await req.json();
  const { blogSlug, blogTitle, blogDescription } = body;

  if (blogSlug !== undefined && !/^[a-z0-9-]{1,100}$/.test(blogSlug)) {
    return errorResponse("Invalid blog slug. Use lowercase letters, numbers, and hyphens only.");
  }

  const [updated] = await db
    .update(users)
    .set({
      ...(blogSlug !== undefined && { blogSlug }),
      ...(blogTitle !== undefined && { blogTitle }),
      ...(blogDescription !== undefined && { blogDescription }),
      updatedAt: new Date(),
    })
    .where(eq(users.id, session.user.id))
    .returning({
      blogSlug: users.blogSlug,
      blogTitle: users.blogTitle,
      blogDescription: users.blogDescription,
    });

  return successResponse(updated);
}
