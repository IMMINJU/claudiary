import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { getTranslations } from "next-intl/server";
import { ApiKeyManager } from "@/components/dashboard/api-key-manager";

export default async function ApiKeysPage() {
  const session = await auth();
  const t = await getTranslations("dashboard");

  const keys = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      lastUsedAt: apiKeys.lastUsedAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, session!.user!.id!));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">{t("apiKeys")}</h1>
      <ApiKeyManager initialKeys={keys} />
    </div>
  );
}
