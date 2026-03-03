import type { Hero } from "@/types/hero";
import type { CounterMatrix } from "@/types/matrix";

export interface Recommendation {
  hero: Hero;
  compositeScore: number;
  breakdown: { vsHero: string; score: number }[];
  isFavorite: boolean;
}

export function computeRecommendations(
  enemyTeam: string[],
  matrix: CounterMatrix,
  heroes: Hero[],
  yourTeam: string[],
  favorites: string[]
): {
  tanks: Recommendation[];
  damage: Recommendation[];
  support: Recommendation[];
} {
  const excluded = new Set([...enemyTeam, ...yourTeam]);
  const favoriteSet = new Set(favorites);

  const recommendations: Recommendation[] = [];

  for (const hero of heroes) {
    if (excluded.has(hero.slug)) continue;

    const breakdown: { vsHero: string; score: number }[] = [];
    let compositeScore = 0;

    for (const enemySlug of enemyTeam) {
      if (!enemySlug) continue;
      const score = matrix[hero.slug]?.[enemySlug] || 0;
      if (score > 0) {
        breakdown.push({ vsHero: enemySlug, score });
      }
      compositeScore += score;
    }

    const isFavorite = favoriteSet.has(hero.slug);
    if (isFavorite) {
      compositeScore = Math.round(compositeScore * 1.15);
    }

    recommendations.push({ hero, compositeScore, breakdown, isFavorite });
  }

  recommendations.sort((a, b) => b.compositeScore - a.compositeScore);

  return {
    tanks: recommendations.filter((r) => r.hero.role === "Tank").slice(0, 3),
    damage: recommendations
      .filter((r) => r.hero.role === "Damage")
      .slice(0, 3),
    support: recommendations
      .filter((r) => r.hero.role === "Support")
      .slice(0, 3),
  };
}
