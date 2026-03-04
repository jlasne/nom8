"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Supabase sends a code for PKCE reset — exchange it for a session
    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (errorParam) {
      setError(errorDescription || "Invalid or expired reset link.");
      return;
    }

    if (code) {
      const supabase = createClient();
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) setError("Invalid or expired reset link. Please request a new one.");
        else setSessionReady(true);
      });
    } else {
      // No code — check if session already active (e.g. token-based link)
      const supabase = createClient();
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) setSessionReady(true);
        else setError("Invalid or expired reset link. Please request a new one.");
      });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) { setError(error.message); return; }
      setSuccess(true);
      setTimeout(() => router.push("/profile"), 2000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-nom8-text mb-2">Set new password</h1>
          <p className="text-nom8-text-muted">Choose a strong password for your account.</p>
        </div>

        <div className="bg-nom8-card rounded-xl border border-white/5 p-6 space-y-4">
          {success ? (
            <div className="text-center space-y-2">
              <p className="text-sm text-green-400 bg-green-400/10 rounded-lg px-4 py-3">
                Password updated! Redirecting to your profile...
              </p>
            </div>
          ) : error && !sessionReady ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-role-damage bg-role-damage/10 rounded-lg px-4 py-3">{error}</p>
              <a href="/login" className="text-nom8-orange hover:underline text-sm">Back to sign in</a>
            </div>
          ) : sessionReady ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nom8-text mb-1">New password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-nom8-text placeholder:text-nom8-text-muted focus:outline-none focus:ring-2 focus:ring-nom8-orange/50 focus:border-nom8-orange/50"
                  placeholder="Min 6 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-nom8-text mb-1">Confirm password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-nom8-text placeholder:text-nom8-text-muted focus:outline-none focus:ring-2 focus:ring-nom8-orange/50 focus:border-nom8-orange/50"
                  placeholder="Repeat password"
                />
              </div>
              {error && (
                <p className="text-sm text-role-damage bg-role-damage/10 rounded-lg px-4 py-2">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-nom8-orange hover:bg-nom8-orange-light text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update password"}
              </button>
            </form>
          ) : (
            <p className="text-nom8-text-muted text-sm text-center">Verifying reset link...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
        <p className="text-nom8-text-muted">Loading...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
