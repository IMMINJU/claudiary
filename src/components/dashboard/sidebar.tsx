"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { FileText, Key, Settings, LogOut, ExternalLink } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardSidebarProps {
  user: { name: string; email: string; image: string };
  blogSlug: string | null;
  labels: { myPosts: string; apiKeys: string; blogSettings: string; myBlog: string };
}

export function DashboardSidebar({ user, blogSlug, labels }: DashboardSidebarProps) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1];

  const navItems = [
    { href: `/${locale}/dashboard`, label: labels.myPosts, icon: FileText },
    { href: `/${locale}/dashboard/api-keys`, label: labels.apiKeys, icon: Key },
    { href: `/${locale}/dashboard/settings`, label: labels.blogSettings, icon: Settings },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border p-4">
        <Link href={`/${locale}`} className="text-lg font-bold text-foreground">
          claudiary
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    render={<Link href={item.href} />}
                  >
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {blogSlug && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      render={
                        <Link
                          href={`/${locale}/blog/${blogSlug}`}
                          target="_blank"
                        />
                      }
                    >
                      <ExternalLink className="size-4" />
                      <span>{labels.myBlog}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
