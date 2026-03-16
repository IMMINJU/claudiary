import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("landing");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf9f7]">
      <main className="flex flex-col items-center gap-8 px-8 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-[#1a1a1a]">
          {t("hero")}
        </h1>
        <p className="max-w-lg text-lg text-[#6b6560]">
          {t("heroDescription")}
        </p>
        <div className="flex gap-4">
          <a
            href="#demo"
            className="rounded-full bg-[#da7756] px-6 py-3 font-medium text-white transition-colors hover:bg-[#c56847]"
          >
            {t("tryDemo")}
          </a>
          <a
            href="/login"
            className="rounded-full border border-[#e5e0db] px-6 py-3 font-medium text-[#1a1a1a] transition-colors hover:bg-[#f0ece8]"
          >
            {t("getStarted")}
          </a>
        </div>
      </main>
    </div>
  );
}
