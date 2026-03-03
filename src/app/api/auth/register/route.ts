import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  // Use admin API: auto-confirms email and bypasses trigger issues
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    console.error("[register] admin.createUser error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  console.log("[register] user created:", data.user.id);

  // Ensure profile row exists (trigger may not have run)
  const { error: profileError } = await adminClient
    .from("profiles")
    .upsert({ id: data.user.id }, { onConflict: "id" });

  if (profileError) {
    console.error("[register] profile upsert error:", profileError);
  }

  // Sign in to set session cookies
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    console.error("[register] signIn error:", signInError);
    return NextResponse.json({ error: signInError.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    user: { id: data.user.id, email: data.user.email },
  });
}
