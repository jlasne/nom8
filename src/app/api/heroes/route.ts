import { NextResponse } from "next/server";
import { getHeroes } from "@/lib/data";

export async function GET() {
  const heroes = await getHeroes();
  return NextResponse.json(heroes);
}
