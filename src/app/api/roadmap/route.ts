/*
  Run this SQL once in your Supabase SQL editor to create the required tables:

  CREATE TABLE roadmap_features (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    status text DEFAULT 'suggested' CHECK (status IN ('suggested','planned','in_progress','done')),
    votes int DEFAULT 0,
    created_at timestamptz DEFAULT now()
  );

  CREATE TABLE roadmap_votes (
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_id uuid REFERENCES roadmap_features(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, feature_id)
  );
*/

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

export async function GET() {
  const user = await getUser();

  const { data: features, error } = await adminClient
    .from("roadmap_features")
    .select("id, title, description, status, votes, created_at")
    .order("votes", { ascending: false });

  if (error) return NextResponse.json({ features: [], votedIds: [] });

  let votedIds: string[] = [];
  if (user) {
    const { data: votes } = await adminClient
      .from("roadmap_votes")
      .select("feature_id")
      .eq("user_id", user.id);
    votedIds = (votes || []).map((v) => v.feature_id as string);
  }

  return NextResponse.json({ features: features || [], votedIds });
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description } = await req.json();
  if (!title || title.trim().length < 5) {
    return NextResponse.json({ error: "Title must be at least 5 characters" }, { status: 400 });
  }

  const { data, error } = await adminClient
    .from("roadmap_features")
    .insert({ title: title.trim(), description: description?.trim() || null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ feature: data });
}
