import { getHeroes } from "@/lib/data";
import QuickVoteGame from "@/components/vote/QuickVoteGame";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ hero?: string }>;
}) {
  const { hero } = await searchParams;
  const heroes = await getHeroes();

  return (
    <QuickVoteGame
      heroes={heroes}
      presetHeroSlug={hero}
    />
  );
}
