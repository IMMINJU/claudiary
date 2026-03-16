import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type { users, posts, apiKeys } from "@/db/schema";

/** DB에서 SELECT한 결과 타입 */
export type User = InferSelectModel<typeof users>;
export type Post = InferSelectModel<typeof posts>;
export type ApiKey = InferSelectModel<typeof apiKeys>;

/** DB INSERT용 타입 */
export type NewUser = InferInsertModel<typeof users>;
export type NewPost = InferInsertModel<typeof posts>;
export type NewApiKey = InferInsertModel<typeof apiKeys>;
