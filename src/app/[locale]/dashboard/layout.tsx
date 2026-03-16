import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getLocale, getTranslations } from "next-intl/server";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const locale = await getLocale();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  const [user] = await db
    .select({ blogSlug: users.blogSlug })
    .from(users)
    .where(eq(users.id, session.user.id!));

  const t = await getTranslations("dashboard");

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar
          user={{
            name: session.user.name ?? "",
            email: session.user.email ?? "",
            image: session.user.image ?? "",
          }}
          blogSlug={user?.blogSlug ?? null}
          labels={{
            myPosts: t("myPosts"),
            apiKeys: t("apiKeys"),
            blogSettings: t("blogSettings"),
            myBlog: t("myBlog"),
          }}
        />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </SidebarProvider>
  );
}
