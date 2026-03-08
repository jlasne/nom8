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
