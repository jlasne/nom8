import { NextRequest, NextResponse } from "next/server";
import { getHeroes, getCounterMatrix, getFavorites, getProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { computeRecommendations } from "@/lib/recommendations";

export async function POST(req: NextRequest) {
  const { enemyTeam, yourTeam = [] } = await req.json();

  if (!enemyTeam || !Array.isArray(enemyTeam) || enemyTeam.length === 0) {
    return NextResponse.json(
      { error: "Enemy team is required" },
      { status: 400 }
    );
  }

  const heroes = await getHeroes();
  const matrix = await getCounterMatrix();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let favorites: string[] = [];
  let isPaid = false;

  if (user) {
    const [favs, profile] = await Promise.all([
      getFavorites(user.id),
      getProfile(user.id),
    ]);
    favorites = favs;
    isPaid = profile?.isPaid ?? false;
  }

  const results = computeRecommendations(
    enemyTeam.filter(Boolean),
    matrix,
    heroes,
    yourTeam.filter(Boolean),
    favorites
  );

  return NextResponse.json({ ...results, isPaid });
}
