import { NextResponse } from "next/server";
import { getGlobalStats } from "@/lib/data";

export async function GET() {
  try {
    const { counterTotals } = await getGlobalStats();
    const total = Object.values(counterTotals).reduce((sum, v) => sum + v, 0);
    return NextResponse.json(
      { total },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
    );
  } catch {
    return NextResponse.json({ total: 0 });
  }
}
