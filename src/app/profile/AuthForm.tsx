"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthForm() {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleAuth = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) { setError(error.message); return; }
      setSuccess("Check your email for a password reset link.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { setError("Invalid email or password"); return; }
      } else {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Something went wrong"); return; }
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) { setError(signInError.message); return; }
      }
      router.refresh();
      router.push("/profile");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m: "login" | "register" | "forgot") => {
    setMode(m);
    setError("");
    setSuccess("");
  };

  // ── Forgot password view ──
  if (mode === "forgot") {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-nom8-text mb-2">Reset password</h1>
          <p className="text-nom8-text-muted">We&apos;ll send a reset link to your email.</p>
        </div>
        <div className="bg-nom8-card rounded-xl border border-white/5 p-6 space-y-4">
          {success ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-green-400 bg-green-400/10 rounded-lg px-4 py-3">{success}</p>
              <button type="button" onClick={() => switchMode("login")} className="text-nom8-orange hover:underline text-sm">
                Back to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgot} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nom8-text mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-nom8-text placeholder:text-nom8-text-muted focus:outline-none focus:ring-2 focus:ring-nom8-orange/50 focus:border-nom8-orange/50"
                  placeholder="you@example.com"
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
                {loading ? "Sending..." : "Send reset link"}
              </button>
              <p className="text-center text-sm text-nom8-text-muted">
                <button type="button" onClick={() => switchMode("login")} className="text-nom8-orange hover:underline">
                  Back to sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ── Login / Register view ──
  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-nom8-text mb-2">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-nom8-text-muted">
          {mode === "login"
            ? "Sign in to manage your mains and track counters."
            : "Lock in your mains so we can optimize your winrate."}
        </p>
      </div>

      <div className="bg-nom8-card rounded-xl border border-white/5 p-6 space-y-4">
        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-nom8-text font-medium py-2.5 rounded-lg transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-white/10" />
          <span className="text-xs text-nom8-text-muted">or</span>
          <div className="flex-1 border-t border-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-nom8-text mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-nom8-text placeholder:text-nom8-text-muted focus:outline-none focus:ring-2 focus:ring-nom8-orange/50 focus:border-nom8-orange/50"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-nom8-text">Password</label>
              {mode === "login" && (
                <button type="button" onClick={() => switchMode("forgot")} className="text-xs text-nom8-text-muted hover:text-nom8-orange transition-colors">
                  Forgot password?
                </button>
              )}
            </div>
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
          {error && (
            <p className="text-sm text-role-damage bg-role-damage/10 rounded-lg px-4 py-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-nom8-orange hover:bg-nom8-orange-light text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-nom8-text-muted">
          {mode === "login" ? (
            <>Don&apos;t have an account?{" "}
              <button type="button" onClick={() => switchMode("register")} className="text-nom8-orange hover:underline">Sign up</button>
            </>
          ) : (
            <>Already have an account?{" "}
              <button type="button" onClick={() => switchMode("login")} className="text-nom8-orange hover:underline">Sign in</button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
