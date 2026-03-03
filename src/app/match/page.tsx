import { getHeroes } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import MatchHelperContent from "./MatchHelperContent";

export default async function MatchPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/profile");

  const heroes = await getHeroes();
  return <MatchHelperContent heroes={heroes} user={user} />;
}
