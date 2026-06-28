import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPaperLeaderboard } from "@/lib/db";
import { paperTierStyle } from "@/lib/paper-score";
import { normLang } from "@/lib/lang";
import { PaperRoaster } from "@/components/PaperRoaster";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "paperMeta" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: { languages: { "zh-CN": "/arxiv", en: "/en/arxiv" } },
    openGraph: { title: t("title"), description: t("description"), type: "website" },
  };
}

export default async function ArxivPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ id?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("paper");
  const initialId = (await searchParams)?.id ?? "";
  const lang = normLang(locale);
  const topPapers = await getPaperLeaderboard("top", 10);

  return (
    <main className="flex flex-1 flex-col items-center px-5 py-14 sm:py-20">
      <Link
        href="/arxiv/leaderboard"
        className="group mb-8 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-gradient-to-r from-amber-500/15 to-orange-500/15 px-4 py-2 text-sm font-medium text-amber-200 transition hover:border-amber-300/70"
      >
        <span className="text-base">🏆</span>
        {t("boardPill")}
        <span className="transition group-hover:translate-x-0.5">→</span>
      </Link>

      <header className="mb-8 flex flex-col items-center text-center">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200">
          {t("betaPill")}
        </span>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{t("heading")}</h1>
        <p className="mt-3 max-w-md text-zinc-400">{t("tagline")}</p>
      </header>

      <PaperRoaster initialInput={initialId} />

      {/* Top papers board */}
      <section className="mt-16 w-full max-w-2xl">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-bold text-zinc-200">{t("boardTop")}</h2>
          <Link
            href="/arxiv/leaderboard"
            className="text-xs text-zinc-400 underline-offset-2 hover:text-zinc-200 hover:underline"
          >
            {t("boardOpen")}
          </Link>
        </div>
        {topPapers.length === 0 ? (
          <p className="text-center text-sm text-zinc-500">{t("boardEmpty")}</p>
        ) : (
          <ol className="flex flex-col gap-2">
            {topPapers.map((p, i) => {
              const st = paperTierStyle(p.tier);
              const tag = lang === "en" ? p.tags.en[0] : p.tags.zh[0];
              return (
                <li key={p.arxiv_id}>
                  <Link
                    href={`/arxiv/${p.arxiv_id}`}
                    prefetch={false}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 hover:bg-white/[0.06]"
                  >
                    <span className="w-5 shrink-0 text-center text-sm font-bold tabular-nums text-zinc-500">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-zinc-200">{p.title}</div>
                      {tag && <div className="truncate text-[11px] text-orange-200/80">#{tag}</div>}
                    </div>
                    <span className={`shrink-0 text-sm font-black tabular-nums ${st.text}`}>
                      {st.emoji} {p.final_score.toFixed(2)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </main>
  );
}
