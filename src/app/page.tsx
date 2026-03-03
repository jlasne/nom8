import { getHeroes } from "@/lib/data";
import QuickVoteGame from "@/components/vote/QuickVoteGame";

export default async function HomePage() {
  const heroes = await getHeroes();

  return <QuickVoteGame heroes={heroes} />;
}
