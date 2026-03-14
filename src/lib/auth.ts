import { createClient } from "@/lib/supabase/server";
import { getFavorites, getProfile } from "@/lib/data";
import type { User } from "@/types/user";

/**
 * Lightweight auth check — only validates session, no DB queries.
 * Use in layout and pages that only need isLoggedIn.
 */
export async function getSession(): Promise<{ id: string; email: string } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;
  return { id: user.id, email: user.email! };
}

/**
 * Full user with favorites and profile — use only on pages that need this data.
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;

  const [favorites, profile] = await Promise.all([
    getFavorites(session.id),
    getProfile(session.id),
  ]);

  return {
    id: session.id,
    email: session.email,
    favorites,
    isPaid: profile?.isPaid ?? false,
  };
}
