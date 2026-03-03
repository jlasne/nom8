import { createClient } from "@/lib/supabase/server";
import { getFavorites, getProfile } from "@/lib/data";
import type { User } from "@/types/user";

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [favorites, profile] = await Promise.all([
    getFavorites(user.id),
    getProfile(user.id),
  ]);

  return {
    id: user.id,
    email: user.email!,
    favorites,
    isPaid: profile?.isPaid ?? false,
  };
}
