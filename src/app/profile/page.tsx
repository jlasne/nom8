import { getHeroes, getGlobalStats } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import ProfileContent from "./ProfileContent";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  // Handle OAuth callback redirected here instead of /auth/callback
  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await adminClient.from("profiles").upsert({ id: user.id }, { onConflict: "id" });
    }
    redirect("/profile");
  }

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [heroes, stats] = await Promise.all([getHeroes(), getGlobalStats()]);
  return (
    <ProfileContent
      heroes={heroes}
      initialFavorites={user.favorites}
      email={user.email}
      initialTargetScores={stats.targetTotals}
    />
  );
}
