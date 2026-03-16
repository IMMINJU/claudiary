/**
 * 제목에서 URL-safe slug를 생성.
 * 한글 등 비ASCII 문자는 유지하되, 공백/특수문자는 하이픈으로 변환.
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s가-힣ㄱ-ㅎㅏ-ㅣa-z0-9-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200);
}
