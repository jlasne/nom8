import { NextRequest, NextResponse } from "next/server";
import {
  getHeroes,
  getTopCountersFor,
  getTopCounteredBy,
} from "@/lib/data";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("hero");

  if (!slug) {
    return NextResponse.json(
      { error: "Missing hero query param" },
      { status: 400 }
    );
  }

  const heroes = await getHeroes();
  const heroMap = Object.fromEntries(heroes.map((h) => [h.slug, h]));

  // Top heroes this hero counters (matrix row)
  const iCounter = await getTopCounteredBy(slug, 5);
  const iCounterEnriched = iCounter.map((e) => ({
    ...e,
    hero: heroMap[e.slug],
  }));

  // Top heroes that counter this hero (matrix column)
  const countersMe = await getTopCountersFor(slug, 5);
  const countersMeEnriched = countersMe.map((e) => ({
    ...e,
    hero: heroMap[e.slug],
  }));

  return NextResponse.json(
    { iCounter: iCounterEnriched, countersMe: countersMeEnriched },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
  );
}
