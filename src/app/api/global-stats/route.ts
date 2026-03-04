import { NextResponse } from "next/server";
import { getGlobalStats, getHeroes } from "@/lib/data";

export async function GET() {
  const [stats, heroes] = await Promise.all([getGlobalStats(), getHeroes()]);
  const heroMap = Object.fromEntries(heroes.map((h) => [h.slug, h]));

  return NextResponse.json({
    bestCounters: stats.bestCounters.map((e) => ({
      ...e,
      hero: heroMap[e.slug] ?? null,
    })),
    mostCountered: stats.mostCountered.map((e) => ({
      ...e,
      hero: heroMap[e.slug] ?? null,
    })),
  });
}
