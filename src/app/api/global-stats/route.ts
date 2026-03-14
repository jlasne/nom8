import { NextResponse } from "next/server";
import { getGlobalStats, getHeroes } from "@/lib/data";
import type { HeroRole } from "@/types/hero";

const ROLES: HeroRole[] = ["Tank", "Damage", "Support"];

export async function GET() {
  const [stats, heroes] = await Promise.all([getGlobalStats(), getHeroes()]);
  const heroMap = Object.fromEntries(heroes.map((h) => [h.slug, h]));
  const { counterTotals, targetTotals } = stats;

  // Top 3 per role by counter total
  const byRole = Object.fromEntries(
    ROLES.map((role) => {
      const top = Object.entries(counterTotals)
        .filter(([slug]) => heroMap[slug]?.role === role)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([slug, totalScore]) => ({ slug, totalScore, hero: heroMap[slug] ?? null }));
      return [role, top];
    })
  );

  // Legacy overall top 3 (kept for backwards compat)
  const bestCounters = Object.entries(counterTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([slug, totalScore]) => ({ slug, totalScore, hero: heroMap[slug] ?? null }));

  const mostCountered = Object.entries(targetTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([slug, totalScore]) => ({ slug, totalScore, hero: heroMap[slug] ?? null }));

  const allTargetScores = Object.fromEntries(
    Object.entries(targetTotals).map(([slug, score]) => [slug, score])
  );
  const allCounterScores = Object.fromEntries(
    Object.entries(counterTotals).map(([slug, score]) => [slug, score])
  );

  return NextResponse.json(
    { byRole, bestCounters, mostCountered, allTargetScores, allCounterScores },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
  );
}
