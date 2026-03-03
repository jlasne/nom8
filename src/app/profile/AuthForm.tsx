"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

      <form
        onSubmit={handleSubmit}
        className="bg-nom8-card rounded-xl border border-white/5 p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-nom8-text mb-1">
            Email
          </label>
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
          <label className="block text-sm font-medium text-nom8-text mb-1">
            Password
          </label>
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
          <p className="text-sm text-role-damage bg-role-damage/10 rounded-lg px-4 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-nom8-orange hover:bg-nom8-orange-light text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading
            ? "Please wait..."
            : mode === "login"
              ? "Sign In"
              : "Create Account"}
        </button>

        <p className="text-center text-sm text-nom8-text-muted">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
                className="text-nom8-orange hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                className="text-nom8-orange hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
