import { getHeroes, getCounterMatrix } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import MatchHelperContent from "./MatchHelperContent";

export default async function MatchPage() {
  const [user, heroes, matrix] = await Promise.all([
    getCurrentUser(),
    getHeroes(),
    getCounterMatrix(),
  ]);

  if (!user) redirect("/login");

  return <MatchHelperContent heroes={heroes} user={user} matrix={matrix} />;
}
