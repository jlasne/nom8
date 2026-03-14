import type { Hero, HeroRole } from "@/types/hero";
import { adminClient } from "@/lib/supabase/admin";
import { cached, invalidateTag } from "@/lib/cache";

// Cache TTLs (seconds)
const HEROES_TTL = 3600;   // 1 hour  — heroes rarely change
const MATRIX_TTL = 300;    // 5 min   — matrix changes with votes
const STATS_TTL  = 300;    // 5 min   — derived from matrix

// ── Heroes ──

export async function getHeroes(): Promise<Hero[]> {
  return cached("heroes:all", ["heroes"], HEROES_TTL, async () => {
    const { data, error } = await adminClient
      .from("heroes")
      .select("*")
      .order("role")
      .order("slug");

    if (error) throw new Error(error.message);
    return data.map(dbRowToHero);
  });
}

export async function getHeroBySlug(slug: string): Promise<Hero | null> {
  // Use the full heroes cache instead of a separate query
  const heroes = await getHeroes();
  return heroes.find((h) => h.slug === slug) ?? null;
}

export async function getHeroesByRole(role: HeroRole): Promise<Hero[]> {
  // Use the full heroes cache instead of a separate query
  const heroes = await getHeroes();
  return heroes.filter((h) => h.role === role);
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

  // Invalidate matrix/stats caches so next read picks up the vote
  invalidateTag("matrix");
  invalidateTag("stats");
}

export async function getTopCountersFor(
  targetSlug: string,
  limit = 3
): Promise<{ slug: string; score: number }[]> {
  // Derive from cached full matrix instead of a separate query
  const matrix = await getCounterMatrix();
  const scores: { slug: string; score: number }[] = [];
  for (const [counterSlug, targets] of Object.entries(matrix)) {
    if (targets[targetSlug]) {
      scores.push({ slug: counterSlug, score: targets[targetSlug] });
    }
  }
  return scores.sort((a, b) => b.score - a.score).slice(0, limit);
}

export async function getTopCounteredBy(
  heroSlug: string,
  limit = 3
): Promise<{ slug: string; score: number }[]> {
  // Derive from cached full matrix instead of a separate query
  const matrix = await getCounterMatrix();
  const row = matrix[heroSlug] || {};
  return Object.entries(row)
    .map(([slug, score]) => ({ slug, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ── Counter matrix as full nested object (for recommendations) ──

async function fetchCounterMatrix(): Promise<Record<string, Record<string, number>>> {
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

export async function getCounterMatrix(): Promise<Record<string, Record<string, number>>> {
  return cached("matrix:full", ["matrix"], MATRIX_TTL, fetchCounterMatrix);
}

// ── Global stats ──

export async function getGlobalStats(): Promise<{
  counterTotals: Record<string, number>;
  targetTotals: Record<string, number>;
}> {
  return cached("stats:global", ["stats"], STATS_TTL, async () => {
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
  });
}

// ── Favorites (user-specific, not cached) ──

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
