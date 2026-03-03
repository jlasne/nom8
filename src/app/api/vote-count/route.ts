import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";

export async function GET() {
  const { data, error } = await adminClient
    .from("counter_matrix")
    .select("score");

  if (error) return NextResponse.json({ total: 0 });

  const total = (data || []).reduce(
    (sum, row) => sum + ((row.score as number) || 0),
    0
  );
  return NextResponse.json({ total });
}
