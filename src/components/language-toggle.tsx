"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LanguageToggle() {
  const pathname = usePathname();
  const router = useRouter();

  const currentLocale = pathname.split("/")[1];
  const targetLocale = currentLocale === "ko" ? "en" : "ko";
  const targetPath = pathname.replace(`/${currentLocale}`, `/${targetLocale}`);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.push(targetPath)}
    >
      {currentLocale === "ko" ? "EN" : "한국어"}
    </Button>
  );
}
