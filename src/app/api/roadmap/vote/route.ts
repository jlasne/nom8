import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function getUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { featureId } = await req.json();
  if (!featureId) return NextResponse.json({ error: "Missing featureId" }, { status: 400 });

  // Check if already voted
  const { data: existing } = await adminClient
    .from("roadmap_votes")
    .select("feature_id")
    .eq("user_id", user.id)
    .eq("feature_id", featureId)
    .maybeSingle();

  if (existing) {
    // Toggle off
    await adminClient
      .from("roadmap_votes")
      .delete()
      .eq("user_id", user.id)
      .eq("feature_id", featureId);

    const { data: feature } = await adminClient
      .from("roadmap_features")
      .select("votes")
      .eq("id", featureId)
      .single();

    const newVotes = Math.max(0, ((feature?.votes as number) || 0) - 1);
    await adminClient
      .from("roadmap_features")
      .update({ votes: newVotes })
      .eq("id", featureId);

    return NextResponse.json({ voted: false, votes: newVotes });
  }

  // Add vote
  await adminClient
    .from("roadmap_votes")
    .insert({ user_id: user.id, feature_id: featureId });

  const { data: feature } = await adminClient
    .from("roadmap_features")
    .select("votes")
    .eq("id", featureId)
    .single();

  const newVotes = ((feature?.votes as number) || 0) + 1;
  await adminClient
    .from("roadmap_features")
    .update({ votes: newVotes })
    .eq("id", featureId);

  return NextResponse.json({ voted: true, votes: newVotes });
}
