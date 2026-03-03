import { NextRequest, NextResponse } from "next/server";
import { getHeroes, recordCounterVote, getTopCountersFor } from "@/lib/data";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { targetSlug, counterSlug, getCounteredSlug } = body;

  if (!targetSlug || !counterSlug || !getCounteredSlug) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Validate all slugs exist
  const heroes = await getHeroes();
  const slugs = new Set(heroes.map((h) => h.slug));
  if (!slugs.has(targetSlug) || !slugs.has(counterSlug) || !slugs.has(getCounteredSlug)) {
    return NextResponse.json({ error: "Invalid hero slug" }, { status: 400 });
  }

  // Ensure all three are different
  if (
    targetSlug === counterSlug ||
    targetSlug === getCounteredSlug ||
    counterSlug === getCounteredSlug
  ) {
    return NextResponse.json(
      { error: "All heroes must be different" },
      { status: 400 }
    );
  }

  // counterSlug counters targetSlug
  await recordCounterVote(counterSlug, targetSlug);

  // targetSlug counters getCounteredSlug
  await recordCounterVote(targetSlug, getCounteredSlug);

  // Return top counters for the target
  const topCounters = await getTopCountersFor(targetSlug, 3);
  const enriched = topCounters.map((entry) => {
    const hero = heroes.find((h) => h.slug === entry.slug);
    return { ...entry, hero };
  });

  return NextResponse.json({ success: true, topCounters: enriched });
}
