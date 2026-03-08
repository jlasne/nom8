import type { Hero, HeroRole } from "@/types/hero";
import { adminClient } from "@/lib/supabase/admin";

// ── Heroes ──

export async function getHeroes(): Promise<Hero[]> {
  const { data, error } = await adminClient
    .from("heroes")
    .select("*")
    .order("role")
    .order("slug");

  if (error) throw new Error(error.message);

  return data.map(dbRowToHero);
}

export async function getHeroBySlug(slug: string): Promise<Hero | null> {
  const { data, error } = await adminClient
    .from("heroes")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return dbRowToHero(data);
}

export async function getHeroesByRole(role: HeroRole): Promise<Hero[]> {
  const { data, error } = await adminClient
    .from("heroes")
    .select("*")
    .eq("role", role)
    .order("slug");

  if (error) throw new Error(error.message);
  return data.map(dbRowToHero);
}

function dbRowToHero(row: Record<string, unknown>): Hero {
  return {
    name: row.name as string,
    slug: row.slug as string,
    role: row.role as HeroRole,
    subrole: row.subrole as Hero["subrole"],
    isAerial: row.is_aerial as boolean,
    canShootAerial: row.can_shoot_aerial as boolean,
    hasShield: row.has_shield as boolean,
    imageUrl: (row.image_url as string) ?? undefined,
  };
}

// ── Counter Matrix ──

export async function recordCounterVote(
  counterSlug: string,
  targetSlug: string,
  weight = 1
): Promise<void> {
  // Read current score then increment (non-atomic but fine for this use case)
  const { data } = await adminClient
    .from("counter_matrix")
    .select("score")
    .eq("counter_slug", counterSlug)
    .eq("target_slug", targetSlug)
    .single();

  const newScore = ((data?.score as number) || 0) + weight;

  const { error } = await adminClient.from("counter_matrix").upsert(
    { counter_slug: counterSlug, target_slug: targetSlug, score: newScore },
    { onConflict: "counter_slug,target_slug" }
  );

  if (error) throw new Error(error.message);
}

export async function getTopCountersFor(
  targetSlug: string,
  limit = 3
): Promise<{ slug: string; score: number }[]> {
  const { data, error } = await adminClient
    .from("counter_matrix")
    .select("counter_slug, score")
    .eq("target_slug", targetSlug)
    .order("score", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data || []).map((r) => ({ slug: r.counter_slug as string, score: r.score as number }));
}

export async function getTopCounteredBy(
  heroSlug: string,
  limit = 3
): Promise<{ slug: string; score: number }[]> {
  const { data, error } = await adminClient
    .from("counter_matrix")
    .select("target_slug, score")
    .eq("counter_slug", heroSlug)
    .order("score", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data || []).map((r) => ({ slug: r.target_slug as string, score: r.score as number }));
}

// ── Counter matrix as full nested object (for recommendations) ──

export async function getCounterMatrix(): Promise<Record<string, Record<string, number>>> {
  const { data, error } = await adminClient
    .from("counter_matrix")
    .select("counter_slug, target_slug, score");

  if (error) throw new Error(error.message);

  const matrix: Record<string, Record<string, number>> = {};
  for (const row of data || []) {
    const c = row.counter_slug as string;
    const t = row.target_slug as string;
    const s = row.score as number;
    if (!matrix[c]) matrix[c] = {};
    matrix[c][t] = s;
  }
  return matrix;
}

// ── Global stats ──

export async function getGlobalStats(): Promise<{
  counterTotals: Record<string, number>;
  targetTotals: Record<string, number>;
}> {
  const { data, error } = await adminClient
    .from("counter_matrix")
    .select("counter_slug, target_slug, score");

  if (error) throw new Error(error.message);

  const counterTotals: Record<string, number> = {};
  const targetTotals: Record<string, number> = {};

  for (const row of data || []) {
    const c = row.counter_slug as string;
    const t = row.target_slug as string;
    const s = row.score as number;
    counterTotals[c] = (counterTotals[c] || 0) + s;
    targetTotals[t] = (targetTotals[t] || 0) + s;
  }

  return { counterTotals, targetTotals };
}

// ── Favorites (used by API routes with user-scoped client) ──

export async function getFavorites(userId: string): Promise<string[]> {
  const { data, error } = await adminClient
    .from("favorites")
    .select("hero_slug")
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return (data || []).map((r) => r.hero_slug as string);
}

export async function toggleFavorite(
  userId: string,
  heroSlug: string
): Promise<string[]> {
  const current = await getFavorites(userId);
  const isFav = current.includes(heroSlug);

  if (isFav) {
    const { error } = await adminClient
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("hero_slug", heroSlug);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await adminClient
      .from("favorites")
      .insert({ user_id: userId, hero_slug: heroSlug });
    if (error) throw new Error(error.message);
  }

  return getFavorites(userId);
}

// ── Profile ──

export async function getProfile(
  userId: string
): Promise<{ isPaid: boolean } | null> {
  const { data, error } = await adminClient
    .from("profiles")
    .select("is_paid")
    .eq("id", userId)
    .single();

  if (error) return null;
  return { isPaid: data.is_paid as boolean };
}
