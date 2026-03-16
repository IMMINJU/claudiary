import { eq } from "drizzle-orm";
import { db } from "@/db";
import { apiKeys, users } from "@/db/schema";
import { hashApiKey } from "./api-key";
import { errorResponse } from "@/lib/api-response";
import { NextRequest, NextResponse } from "next/server";

interface ApiKeyUser {
  id: string;
  email: string;
  name: string | null;
}

/**
 * v1 API용 API Key 인증.
 * Bearer 토큰에서 API Key를 추출하고 DB에서 검증.
 */
export async function requireApiKey(
  req: NextRequest,
): Promise<[ApiKeyUser, null] | [null, NextResponse]> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return [null, errorResponse("Missing or invalid Authorization header", 401)];
  }

  const rawKey = authHeader.slice(7);
  const keyHash = hashApiKey(rawKey);

  const result = await db
    .select({
      keyId: apiKeys.id,
      userId: apiKeys.userId,
      userName: users.name,
      userEmail: users.email,
    })
    .from(apiKeys)
    .innerJoin(users, eq(apiKeys.userId, users.id))
    .where(eq(apiKeys.keyHash, keyHash))
    .limit(1);

  if (result.length === 0) {
    return [null, errorResponse("Invalid API key", 401)];
  }

  // lastUsedAt 업데이트 (fire-and-forget)
  db.update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, result[0].keyId))
    .execute()
    .catch(() => {});

  return [
    { id: result[0].userId, email: result[0].userEmail, name: result[0].userName },
    null,
  ];
}
