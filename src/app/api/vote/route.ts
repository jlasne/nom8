import { NextRequest, NextResponse } from "next/server";
import { getHeroes, recordCounterVote } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { targetSlug, optionSlug, verdict } = await req.json();

  if (!targetSlug || !optionSlug || !verdict) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (!["counters", "neutral", "countered"].includes(verdict)) {
    return NextResponse.json({ error: "Invalid verdict" }, { status: 400 });
  }

  const heroes = await getHeroes();
  const slugs = new Set(heroes.map((h) => h.slug));
  if (!slugs.has(targetSlug) || !slugs.has(optionSlug)) {
    return NextResponse.json({ error: "Invalid hero slug" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const weight = user ? 2 : 1;

  if (verdict === "counters") {
    await recordCounterVote(optionSlug, targetSlug, weight);
  } else if (verdict === "countered") {
    await recordCounterVote(targetSlug, optionSlug, weight);
  }
  // neutral: nothing recorded

  return NextResponse.json({ success: true });
}
