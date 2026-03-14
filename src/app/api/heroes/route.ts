import { NextResponse } from "next/server";
import { getHeroes } from "@/lib/data";

export async function GET() {
  const heroes = await getHeroes();
  return NextResponse.json(heroes, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
  });
}
