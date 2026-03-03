"use client";

import type { Hero, HeroRole } from "@/types/hero";
import HeroIcon from "@/components/hero/HeroIcon";
import RoleBadge from "@/components/hero/RoleBadge";

interface Recommendation {
  hero: Hero;
  compositeScore: number;
  breakdown: { vsHero: string; score: number }[];
  isFavorite: boolean;
}

interface RecommendationPanelProps {
  tanks: Recommendation[];
  damage: Recommendation[];
  support: Recommendation[];
  isPaid: boolean;
  heroes: Hero[];
  loading: boolean;
}

function RoleSection({
  title,
  role,
  recommendations,
  isPaid,
  heroes,
  bestOverallSlug,
}: {
  title: string;
  role: HeroRole;
  recommendations: Recommendation[];
  isPaid: boolean;
  heroes: Hero[];
  bestOverallSlug?: string;
}) {
  if (recommendations.length === 0) {
    return (
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-nom8-text-muted uppercase tracking-wider mb-3">
          {title}
        </h4>
        <p className="text-sm text-nom8-text-muted">No recommendations</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h4 className="text-sm font-semibold text-nom8-text-muted uppercase tracking-wider mb-3">
        {title}
      </h4>
      <div className="space-y-3">
        {recommendations.map((rec, i) => {
          const isBest = rec.hero.slug === bestOverallSlug;
          const isLocked = !isPaid && i > 0;

          return (
            <div
              key={rec.hero.slug}
              className={`relative rounded-lg p-4 border transition-all ${
                isBest && isPaid
                  ? "border-nom8-orange bg-nom8-orange/5"
                  : "border-white/5 bg-white/5"
              } ${isLocked ? "opacity-40 select-none" : ""}`}
            >
              {isBest && isPaid && (
                <span className="absolute -top-2 left-4 bg-nom8-orange text-white text-xs font-bold px-2 py-0.5 rounded">
                  BEST PICK
                </span>
              )}

              <div className="flex items-center gap-3">
                <HeroIcon hero={rec.hero} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-nom8-text">
                      {rec.hero.name}
                    </p>
                    {rec.isFavorite && (
                      <span className="text-nom8-orange text-xs">{"\u2665"} Main</span>
                    )}
                  </div>
                  <RoleBadge role={rec.hero.role} />
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-nom8-orange">
                    +{rec.compositeScore}
                  </p>
                  <p className="text-xs text-nom8-text-muted">winrate boost</p>
                </div>
              </div>

              {rec.breakdown.length > 0 && !isLocked && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {rec.breakdown.map((b) => {
                    const enemy = heroes.find((h) => h.slug === b.vsHero);
                    return (
                      <span
                        key={b.vsHero}
                        className="text-xs bg-verdict-counter/10 text-verdict-counter px-2 py-0.5 rounded"
                      >
                        Strong vs {enemy?.name || b.vsHero}
                      </span>
                    );
                  })}
                </div>
              )}

              {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-nom8-card/80 rounded-lg backdrop-blur-sm">
                  <span className="text-sm text-nom8-text-muted">
                    Upgrade to Pro to unlock
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function RecommendationPanel({
  tanks,
  damage,
  support,
  isPaid,
  heroes,
  loading,
}: RecommendationPanelProps) {
  if (loading) {
    return (
      <div className="bg-nom8-card rounded-xl border border-white/5 p-8 text-center">
        <p className="text-nom8-text-muted">Calculating best picks...</p>
      </div>
    );
  }

  const allRecs = [...tanks, ...damage, ...support];
  const bestOverall = allRecs.length > 0
    ? allRecs.reduce((best, r) =>
        r.compositeScore > best.compositeScore ? r : best
      )
    : null;

  return (
    <div className="bg-nom8-card rounded-xl border border-white/5 p-6">
      <h3 className="text-lg font-bold text-nom8-text mb-1">
        Your best picks this match
      </h3>
      <p className="text-sm text-nom8-text-muted mb-6">
        Never blind-pick again.
      </p>

      <RoleSection
        title="Tank Picks"
        role="Tank"
        recommendations={tanks}
        isPaid={isPaid}
        heroes={heroes}
        bestOverallSlug={bestOverall?.hero.slug}
      />
      <RoleSection
        title="Damage Picks"
        role="Damage"
        recommendations={damage}
        isPaid={isPaid}
        heroes={heroes}
        bestOverallSlug={bestOverall?.hero.slug}
      />
      <RoleSection
        title="Support Picks"
        role="Support"
        recommendations={support}
        isPaid={isPaid}
        heroes={heroes}
        bestOverallSlug={bestOverall?.hero.slug}
      />
    </div>
  );
}
