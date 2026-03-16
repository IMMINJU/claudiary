import { NextRequest } from "next/server";
import { requireApiKey } from "@/lib/auth/verify-api-key";
import { successResponse } from "@/lib/api-response";

/** GET /api/v1/me — 연결 확인 */
export async function GET(req: NextRequest) {
  const [user, error] = await requireApiKey(req);
  if (error) return error;

  return successResponse(user);
}
