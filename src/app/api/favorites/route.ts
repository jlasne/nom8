import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toggleFavorite } from "@/lib/data";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { heroSlug } = await req.json();
  if (!heroSlug) {
    return NextResponse.json({ error: "Missing heroSlug" }, { status: 400 });
  }

  const favorites = await toggleFavorite(user.id, heroSlug);
  return NextResponse.json({ success: true, favorites });
}
