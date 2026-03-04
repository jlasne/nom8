import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { auth_request_id, decision } = await req.json();

  if (!auth_request_id || !["allow", "deny"].includes(decision)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Call Supabase OAuth Server to complete the authorization
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const res = await fetch(`${supabaseUrl}/auth/v1/oauth/authorize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`,
      "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    },
    body: JSON.stringify({
      auth_request_id,
      decision,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[oauth/consent] Supabase error:", text);
    return NextResponse.json({ error: "Authorization failed" }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json({ redirect_to: data.redirect_to ?? data.url ?? "/" });
}
