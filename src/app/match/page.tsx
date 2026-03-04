import { getHeroes } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import MatchHelperContent from "./MatchHelperContent";

export default async function MatchPage() {
  const [user, heroes] = await Promise.all([getCurrentUser(), getHeroes()]);

  if (!user) redirect("/login");

  return <MatchHelperContent heroes={heroes} user={user} />;
}
