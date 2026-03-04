"use client";

import { useState } from "react";

export default function ConsentActions({ authRequestId }: { authRequestId: string }) {
  const [loading, setLoading] = useState<"allow" | "deny" | null>(null);
  const [error, setError] = useState("");

  const handleDecision = async (decision: "allow" | "deny") => {
    setLoading(decision);
    setError("");
    try {
      const res = await fetch("/api/oauth/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auth_request_id: authRequestId, decision }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); return; }
      if (data.redirect_to) window.location.href = data.redirect_to;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-role-damage bg-role-damage/10 rounded-lg px-4 py-2 text-center">{error}</p>
      )}
      <button
        onClick={() => handleDecision("allow")}
        disabled={!!loading}
        className="w-full bg-nom8-orange hover:bg-nom8-orange/90 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading === "allow" ? "Authorizing..." : "Allow access"}
      </button>
      <button
        onClick={() => handleDecision("deny")}
        disabled={!!loading}
        className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-nom8-text-muted font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading === "deny" ? "Denying..." : "Deny"}
      </button>
    </div>
  );
}
