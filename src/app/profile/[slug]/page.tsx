import { getHeroBySlug, getHeroes, getTopCountersFor, getTopCounteredBy } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import HeroIcon from "@/components/hero/HeroIcon";
import RoleBadge from "@/components/hero/RoleBadge";

export default async function HeroDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [hero, heroes, topCountersFor, topCounteredBy] = await Promise.all([
    getHeroBySlug(slug),
    getHeroes(),
    getTopCountersFor(slug, 5),
    getTopCounteredBy(slug, 5),
  ]);

  if (!hero) notFound();

  const heroMap = Object.fromEntries(heroes.map((h) => [h.slug, h]));

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1 text-sm text-nom8-text-muted hover:text-nom8-text transition-colors mb-6"
      >
        ← Back to profile
      </Link>

      {/* Hero header */}
      <div className="bg-nom8-card rounded-2xl border border-white/5 p-8 flex items-center gap-6 mb-6">
        <HeroIcon hero={hero} size="xl" />
        <div>
          <h1 className="text-3xl font-bold text-nom8-text">{hero.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <RoleBadge role={hero.role} />
            <span className="text-sm text-nom8-text-muted">{hero.subrole}</span>
          </div>
        </div>
      </div>

      {/* Counter data */}
      <div className="grid grid-cols-2 gap-4">
        {/* Countered by */}
        <div className="bg-nom8-card rounded-xl border border-white/5 p-5">
          <h3 className="text-xs font-semibold text-nom8-text-muted uppercase tracking-wider mb-4">
            Countered by
          </h3>
          <div className="space-y-1">
            {topCountersFor.map((entry, i) => {
              const h = heroMap[entry.slug];
              if (!h) return null;
              return (
                <Link
                  key={entry.slug}
                  href={`/profile/${entry.slug}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <span className="text-nom8-orange font-bold text-xs w-5">
                    #{i + 1}
                  </span>
                  <HeroIcon hero={h} size="sm" />
                  <span className="text-nom8-text text-sm flex-1">{h.name}</span>
                  <span className="text-xs text-nom8-text-muted font-mono">
                    {entry.score}
                  </span>
                </Link>
              );
            })}
            {topCountersFor.length === 0 && (
              <p className="text-nom8-text-muted text-sm">No data yet</p>
            )}
          </div>
        </div>

        {/* Counters these heroes */}
        <div className="bg-nom8-card rounded-xl border border-white/5 p-5">
          <h3 className="text-xs font-semibold text-nom8-text-muted uppercase tracking-wider mb-4">
            Counters
          </h3>
          <div className="space-y-1">
            {topCounteredBy.map((entry, i) => {
              const h = heroMap[entry.slug];
              if (!h) return null;
              return (
                <Link
                  key={entry.slug}
                  href={`/profile/${entry.slug}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <span className="text-nom8-orange font-bold text-xs w-5">
                    #{i + 1}
                  </span>
                  <HeroIcon hero={h} size="sm" />
                  <span className="text-nom8-text text-sm flex-1">{h.name}</span>
                  <span className="text-xs text-nom8-text-muted font-mono">
                    {entry.score}
                  </span>
                </Link>
              );
            })}
            {topCounteredBy.length === 0 && (
              <p className="text-nom8-text-muted text-sm">No data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
