import { getHeroBySlug, getHeroes, getTopCountersFor, getTopCounteredBy } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import HeroIcon from "@/components/hero/HeroIcon";
import RoleBadge from "@/components/hero/RoleBadge";
import type { Hero, HeroRole } from "@/types/hero";

const ROLES: HeroRole[] = ["Tank", "Damage", "Support"];

const ROLE_COLORS: Record<HeroRole, string> = {
  Tank: "text-blue-400",
  Damage: "text-red-400",
  Support: "text-green-400",
};

function CounterColumn({
  role,
  entries,
  heroMap,
}: {
  role: HeroRole;
  entries: { slug: string; score: number }[];
  heroMap: Record<string, Hero>;
}) {
  const filtered = entries.filter((e) => heroMap[e.slug]?.role === role).slice(0, 5);
  return (
    <div className="bg-nom8-card rounded-xl border border-white/5 p-4">
      <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${ROLE_COLORS[role]}`}>
        {role}
      </p>
      <div className="space-y-1">
        {filtered.length === 0 && (
          <p className="text-nom8-text-muted text-xs">No data yet</p>
        )}
        {filtered.map((entry, i) => {
          const h = heroMap[entry.slug];
          if (!h) return null;
          return (
            <Link
              key={entry.slug}
              href={`/profile/${entry.slug}`}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <span className="text-nom8-orange font-bold text-xs w-4">#{i + 1}</span>
              <HeroIcon hero={h} size="sm" />
              <span className="text-nom8-text text-xs flex-1 truncate">{h.name}</span>
              <span className="text-xs text-nom8-text-muted font-mono">{entry.score}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default async function HeroDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [hero, heroes, topCountersFor, topCounteredBy] = await Promise.all([
    getHeroBySlug(slug),
    getHeroes(),
    getTopCountersFor(slug, 30),
    getTopCounteredBy(slug, 30),
  ]);

  if (!hero) notFound();

  const heroMap = Object.fromEntries(heroes.map((h) => [h.slug, h]));

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1 text-sm text-nom8-text-muted hover:text-nom8-text transition-colors mb-6"
      >
        ← Back to profile
      </Link>

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

      <Link
        href={`/?hero=${hero.slug}`}
        className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-nom8-orange hover:bg-nom8-orange/90 text-white font-semibold text-sm transition-colors mb-6"
      >
        Vote on {hero.name} matchups →
      </Link>

      <div className="mb-6">
        <h3 className="text-xs font-semibold text-nom8-text-muted uppercase tracking-wider mb-3">
          Countered by
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {ROLES.map((role) => (
            <CounterColumn key={role} role={role} entries={topCountersFor} heroMap={heroMap} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-nom8-text-muted uppercase tracking-wider mb-3">
          {hero.name} counters
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {ROLES.map((role) => (
            <CounterColumn key={role} role={role} entries={topCounteredBy} heroMap={heroMap} />
          ))}
        </div>
      </div>
    </div>
  );
}
