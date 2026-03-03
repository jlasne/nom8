import { getHeroes } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import QuickVoteGame from "@/components/vote/QuickVoteGame";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ hero?: string }>;
}) {
  const { hero } = await searchParams;
  const [heroes, user] = await Promise.all([getHeroes(), getCurrentUser()]);

  return (
    <QuickVoteGame
      heroes={heroes}
      presetHeroSlug={hero}
      isLoggedIn={!!user}
    />
  );
}
