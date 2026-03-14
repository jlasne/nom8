import { getHeroes, getGlobalStats } from "@/lib/data";
import QuickVoteGame from "@/components/vote/QuickVoteGame";

export default async function VotePage({
  searchParams,
}: {
  searchParams: Promise<{ hero?: string }>;
}) {
  const { hero } = await searchParams;
  const [heroes, stats] = await Promise.all([getHeroes(), getGlobalStats()]);

  const counterTotals = stats.counterTotals;
  const allCounterScores: Record<string, number> = {};
  for (const [slug, score] of Object.entries(counterTotals)) {
    allCounterScores[slug] = score;
  }

  return (
    <QuickVoteGame
      heroes={heroes}
      presetHeroSlug={hero}
      initialGlobalStats={{ allCounterScores }}
    />
  );
}
