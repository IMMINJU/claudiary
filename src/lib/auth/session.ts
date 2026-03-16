import { auth } from "@/auth";
import { errorResponse } from "@/lib/api-response";
import { NextResponse } from "next/server";

interface AuthenticatedSession {
  user: { id: string; name?: string | null; email?: string | null; image?: string | null };
}

/**
 * 웹 API용 세션 확인. 비로그인이면 401 응답을 반환.
 * 사용법: const [session, errorRes] = await requireSession();
 *         if (errorRes) return errorRes;
 */
export async function requireSession(): Promise<
  [AuthenticatedSession, null] | [null, NextResponse]
> {
  const session = await auth();
  if (!session?.user?.id) {
    return [null, errorResponse("Unauthorized", 401)];
  }
  return [{ user: { ...session.user, id: session.user.id } }, null];
}
