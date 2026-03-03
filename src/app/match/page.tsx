import { getHeroes } from "@/lib/data";
import MatchHelperContent from "./MatchHelperContent";

export default async function MatchPage() {
  const heroes = await getHeroes();
  return <MatchHelperContent heroes={heroes} />;
}
