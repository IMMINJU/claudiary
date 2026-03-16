import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { requireSession } from "@/lib/auth/session";
import { generateApiKey, hashApiKey, getKeyPrefix } from "@/lib/auth/api-key";
import { successResponse, errorResponse } from "@/lib/api-response";

/** GET /api/web/api-keys — 목록 조회 */
export async function GET() {
  const [session, error] = await requireSession();
  if (error) return error;

  const keys = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      lastUsedAt: apiKeys.lastUsedAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, session.user.id));

  return successResponse(keys);
}

/** POST /api/web/api-keys — 키 생성 */
export async function POST(req: NextRequest) {
  const [session, error] = await requireSession();
  if (error) return error;

  const body = await req.json();
  const name = body.name?.trim();
  if (!name) {
    return errorResponse("name is required");
  }

  const rawKey = generateApiKey();
  const keyHash = hashApiKey(rawKey);
  const keyPrefix = getKeyPrefix(rawKey);

  const [created] = await db
    .insert(apiKeys)
    .values({
      userId: session.user.id,
      name,
      keyHash,
      keyPrefix,
    })
    .returning({ id: apiKeys.id, name: apiKeys.name, createdAt: apiKeys.createdAt });

  return successResponse(
    { ...created, key: rawKey, keyPrefix },
    201,
  );
}
