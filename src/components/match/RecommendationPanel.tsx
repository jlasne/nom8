"use client";

import { useState } from "react";
import type { Hero } from "@/types/hero";
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
  heroes: Hero[];
  loading: boolean;
  userFavorites?: string[];
}

function RecCard({ rec, heroes, rank }: { rec: Recommendation; heroes: Hero[]; rank?: number }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/5">
      {rank !== undefined && (
        <span className="text-nom8-orange font-bold text-xs w-5 shrink-0">#{rank + 1}</span>
      )}
      <HeroIcon hero={rec.hero} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-nom8-text text-sm">{rec.hero.name}</p>
          {rec.isFavorite && (
            <span className="text-nom8-orange text-xs">♥ Main</span>
          )}
        </div>
        <RoleBadge role={rec.hero.role} />
      </div>
      <div className="text-right shrink-0">
        <p className="text-base font-bold text-nom8-orange">+{rec.compositeScore}</p>
        <p className="text-xs text-nom8-text-muted">boost</p>
      </div>
    </div>
  );
}

export default function RecommendationPanel({
  tanks,
  damage,
  support,
  heroes,
  loading,
  userFavorites = [],
}: RecommendationPanelProps) {
  const [unlocked, setUnlocked] = useState(false);

  if (loading) {
    return (
      <div className="bg-nom8-card rounded-xl border border-white/5 p-8 text-center">
        <p className="text-nom8-text-muted">Calculating best picks...</p>
      </div>
    );
  }

  const allRecs = [...tanks, ...damage, ...support];
  if (allRecs.length === 0) {
    return (
      <div className="bg-nom8-card rounded-xl border border-white/5 p-8 text-center">
        <p className="text-nom8-text-muted text-sm">No recommendations yet.</p>
      </div>
    );
  }

  // Locked view — show best 1 per role + CTA
  if (!unlocked) {
    const roleBests = [
      tanks[0] ? { rec: tanks[0], label: "Best Tank" } : null,
      damage[0] ? { rec: damage[0], label: "Best Damage" } : null,
      support[0] ? { rec: support[0], label: "Best Support" } : null,
    ].filter(Boolean) as { rec: Recommendation; label: string }[];

    return (
      <div className="bg-nom8-card rounded-xl border border-white/5 p-6 space-y-5">
        <div>
          <h3 className="text-lg font-bold text-nom8-text mb-1">Your best picks this match</h3>
          <p className="text-sm text-nom8-text-muted">Top counter pick per role.</p>
        </div>

        <div className="space-y-3">
          {roleBests.map(({ rec, label }) => (
            <div key={rec.hero.slug} className="relative rounded-xl p-4 border border-white/10 bg-white/5">
              <span className="absolute -top-2.5 left-4 bg-nom8-card border border-white/10 text-nom8-text-muted text-xs font-bold px-2 py-0.5 rounded">
                {label}
              </span>
              <div className="flex items-center gap-3">
                <HeroIcon hero={rec.hero} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-nom8-text">{rec.hero.name}</p>
                    {rec.isFavorite && <span className="text-nom8-orange text-xs">♥ Main</span>}
                  </div>
                  <RoleBadge role={rec.hero.role} />
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-nom8-orange">+{rec.compositeScore}</p>
                  <p className="text-xs text-nom8-text-muted">boost</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Unlock CTA */}
        <div className="border border-white/10 rounded-xl p-5 text-center space-y-3">
          <p className="text-sm text-nom8-text-muted">
            See personalised picks based on your mains, the perfect team composition, and top 5 heroes per role.
          </p>
          <button
            onClick={() => setUnlocked(true)}
            className="w-full py-3 px-6 rounded-xl bg-nom8-orange hover:bg-nom8-orange/90 text-white font-semibold text-sm transition-colors"
          >
            Unlock full insights →
          </button>
        </div>
      </div>
    );
  }

  // Unlocked view
  const favoriteSet = new Set(userFavorites);
  const mainRecs = allRecs.filter((r) => favoriteSet.has(r.hero.slug)).sort((a, b) => b.compositeScore - a.compositeScore);

  // Perfect composition: best tank + top 2 damage + top 2 support
  const perfectComp = [
    ...(tanks.length > 0 ? [tanks[0]] : []),
    ...damage.slice(0, 2),
    ...support.slice(0, 2),
  ];

  return (
    <div className="bg-nom8-card rounded-xl border border-white/5 p-6 space-y-8">

      {/* Section A — Your Mains */}
      <div>
        <h3 className="text-sm font-semibold text-nom8-text-muted uppercase tracking-wider mb-3">
          ♥ Your Mains
        </h3>
        {mainRecs.length > 0 ? (
          <div className="space-y-2">
            {mainRecs.map((rec, i) => (
              <RecCard key={rec.hero.slug} rec={rec} heroes={heroes} rank={i} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-nom8-text-muted">
            Favourite heroes on your profile to get personalised picks.
          </p>
        )}
      </div>

      {/* Section B — Perfect Composition */}
      <div>
        <h3 className="text-sm font-semibold text-nom8-text-muted uppercase tracking-wider mb-1">
          Perfect Composition
        </h3>
        <p className="text-xs text-nom8-text-muted mb-3">Suggested team vs this enemy lineup</p>
        <div className="flex flex-wrap gap-2">
          {perfectComp.map((rec) => (
            <div
              key={rec.hero.slug}
              className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2"
            >
              <HeroIcon hero={rec.hero} size="sm" />
              <div>
                <p className="text-nom8-text text-xs font-medium">{rec.hero.name}</p>
                <RoleBadge role={rec.hero.role} />
              </div>
            </div>
          ))}
          {perfectComp.length === 0 && (
            <p className="text-sm text-nom8-text-muted">No data yet.</p>
          )}
        </div>
      </div>

      {/* Section C — Per Role Top 5 */}
      {(
        [
          { title: "Tank Picks", recs: tanks },
          { title: "Damage Picks", recs: damage },
          { title: "Support Picks", recs: support },
        ] as const
      ).map(({ title, recs }) => (
        <div key={title}>
          <h3 className="text-sm font-semibold text-nom8-text-muted uppercase tracking-wider mb-3">
            {title}
          </h3>
          {recs.length > 0 ? (
            <div className="space-y-2">
              {recs.map((rec, i) => (
                <RecCard key={rec.hero.slug} rec={rec} heroes={heroes} rank={i} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-nom8-text-muted">No recommendations.</p>
          )}
        </div>
      ))}
    </div>
  );
}
