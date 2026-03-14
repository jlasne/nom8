import { getHeroes, getGlobalStats, getTopCountersFor, getTopCounteredBy } from "@/lib/data";
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

  // Pre-compute mains insights server-side (avoids N client-side /api/matrix calls)
  const heroMap = Object.fromEntries(heroes.map((h) => [h.slug, h]));
  const insightsEntries = await Promise.all(
    user.favorites.map(async (slug) => {
      const [countersMe, iCounter] = await Promise.all([
        getTopCountersFor(slug, 3),
        getTopCounteredBy(slug, 3),
      ]);
      return [slug, {
        countersMe: countersMe.map((e) => ({ ...e, hero: heroMap[e.slug] })),
        iCounter: iCounter.map((e) => ({ ...e, hero: heroMap[e.slug] })),
      }] as const;
    })
  );
  const initialMainsInsights = Object.fromEntries(insightsEntries);

  return (
    <ProfileContent
      heroes={heroes}
      initialFavorites={user.favorites}
      email={user.email}
      initialTargetScores={stats.targetTotals}
      initialMainsInsights={initialMainsInsights}
    />
  );
}
