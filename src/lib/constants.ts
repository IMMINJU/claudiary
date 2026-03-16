/** 글 상태 */
export const POST_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
} as const;

export type PostStatus = (typeof POST_STATUS)[keyof typeof POST_STATUS];

/** 글 생성 출처 */
export const POST_SOURCE = {
  SKILL: "skill",
  WEB: "web",
} as const;

export type PostSource = (typeof POST_SOURCE)[keyof typeof POST_SOURCE];

/** API Key 설정 */
export const API_KEY_PREFIX = "cldy_";
export const API_KEY_BYTE_LENGTH = 32;

/** Rate limiting */
export const RATE_LIMIT_MAX_REQUESTS = 60;
export const RATE_LIMIT_WINDOW_MS = 60_000;
