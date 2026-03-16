import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getTranslations } from "next-intl/server";
import { SettingsForm } from "@/components/dashboard/settings-form";

export default async function SettingsPage() {
  const session = await auth();
  const t = await getTranslations("dashboard");

  const [user] = await db
    .select({
      blogSlug: users.blogSlug,
      blogTitle: users.blogTitle,
      blogDescription: users.blogDescription,
    })
    .from(users)
    .where(eq(users.id, session!.user!.id!));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">{t("blogSettings")}</h1>
      <SettingsForm
        initialData={{
          blogSlug: user.blogSlug ?? "",
          blogTitle: user.blogTitle ?? "",
          blogDescription: user.blogDescription ?? "",
        }}
      />
    </div>
  );
}
