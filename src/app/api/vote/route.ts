import { NextRequest, NextResponse } from "next/server";
import { getHeroes, recordCounterVote } from "@/lib/data";

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

  if (verdict === "counters") {
    await recordCounterVote(optionSlug, targetSlug);
  } else if (verdict === "countered") {
    await recordCounterVote(targetSlug, optionSlug);
  }
  // neutral: nothing recorded

  return NextResponse.json({ success: true });
}
