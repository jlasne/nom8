"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Status = "suggested" | "planned" | "in_progress" | "done";

interface Feature {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  votes: number;
  created_at: string;
}

const STATUS_LABELS: Record<Status, string> = {
  suggested: "Suggested",
  planned: "Planned",
  in_progress: "In Progress",
  done: "Done",
};

const STATUS_COLORS: Record<Status, string> = {
  suggested: "bg-white/10 text-nom8-text-muted",
  planned: "bg-nom8-orange/20 text-nom8-orange",
  in_progress: "bg-blue-500/20 text-blue-400",
  done: "bg-green-500/20 text-green-400",
};

export default function RoadmapClient() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    fetch("/api/roadmap")
      .then((r) => r.json())
      .then((data) => {
        setFeatures(data.features || []);
        setVotedIds(new Set(data.votedIds || []));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleVote = async (featureId: string) => {
    if (!isLoggedIn) return;
    // Optimistic update
    const alreadyVoted = votedIds.has(featureId);
    setVotedIds((prev) => {
      const next = new Set(prev);
      alreadyVoted ? next.delete(featureId) : next.add(featureId);
      return next;
    });
    setFeatures((prev) =>
      prev.map((f) =>
        f.id === featureId ? { ...f, votes: f.votes + (alreadyVoted ? -1 : 1) } : f
      )
    );

    const res = await fetch("/api/roadmap/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featureId }),
    });
    if (!res.ok) {
      // Revert on error
      setVotedIds((prev) => {
        const next = new Set(prev);
        alreadyVoted ? next.add(featureId) : next.delete(featureId);
        return next;
      });
      setFeatures((prev) =>
        prev.map((f) =>
          f.id === featureId ? { ...f, votes: f.votes + (alreadyVoted ? 1 : -1) } : f
        )
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (title.trim().length < 5) {
      setError("Title must be at least 5 characters.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/roadmap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to submit.");
    } else {
      setFeatures((prev) => [data.feature, ...prev]);
      setTitle("");
      setDescription("");
      setShowForm(false);
    }
    setSubmitting(false);
  };

  const grouped = (["in_progress", "planned", "suggested", "done"] as Status[]).reduce(
    (acc, status) => {
      acc[status] = features.filter((f) => f.status === status);
      return acc;
    },
    {} as Record<Status, Feature[]>
  );

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-nom8-text">Roadmap</h1>
        {isLoggedIn ? (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-4 py-2 rounded-xl bg-nom8-orange hover:bg-nom8-orange/90 text-white text-sm font-semibold transition-colors"
          >
            {showForm ? "Cancel" : "+ Suggest a feature"}
          </button>
        ) : (
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-nom8-text-muted text-sm font-medium transition-colors"
          >
            Connect to suggest
          </Link>
        )}
      </div>
      <p className="text-nom8-text-muted text-sm mb-8">
        Vote on what you want next. Most-voted features get built first.
      </p>

      {/* Suggest form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-nom8-card border border-white/10 rounded-xl p-5 mb-8 space-y-3"
        >
          <h2 className="text-sm font-semibold text-nom8-text">New feature request</h2>
          <div>
            <input
              type="text"
              placeholder="Short title (e.g. 'Filter by role on home page')"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-nom8-text placeholder:text-nom8-text-muted focus:outline-none focus:border-nom8-orange/50"
            />
          </div>
          <div>
            <textarea
              placeholder="Optional — describe the problem this solves"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-nom8-text placeholder:text-nom8-text-muted focus:outline-none focus:border-nom8-orange/50 resize-none"
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-lg bg-nom8-orange hover:bg-nom8-orange/90 text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </form>
      )}

      {loading && (
        <p className="text-nom8-text-muted text-sm text-center py-12">Loading…</p>
      )}

      {!loading && features.length === 0 && (
        <div className="text-center py-16 text-nom8-text-muted">
          <p className="text-4xl mb-3">🗺</p>
          <p className="font-semibold text-nom8-text mb-1">No features yet</p>
          <p className="text-sm">Be the first to suggest one!</p>
        </div>
      )}

      {/* Grouped sections */}
      {(["in_progress", "planned", "suggested", "done"] as Status[]).map((status) => {
        const items = grouped[status];
        if (items.length === 0) return null;
        return (
          <div key={status} className="mb-8">
            <p className="text-xs text-nom8-text-muted uppercase tracking-widest mb-3">
              {STATUS_LABELS[status]}
            </p>
            <div className="space-y-3">
              {items.map((feature) => {
                const voted = votedIds.has(feature.id);
                return (
                  <div
                    key={feature.id}
                    className="bg-nom8-card border border-white/5 rounded-xl p-4 flex gap-4 items-start"
                  >
                    {/* Vote button */}
                    <button
                      onClick={() => handleVote(feature.id)}
                      disabled={!isLoggedIn}
                      title={isLoggedIn ? (voted ? "Remove vote" : "Upvote") : "Connect to vote"}
                      className={`flex flex-col items-center gap-0.5 min-w-[40px] py-1 px-2 rounded-lg border transition-colors ${
                        voted
                          ? "border-nom8-orange/50 bg-nom8-orange/10 text-nom8-orange"
                          : "border-white/10 text-nom8-text-muted hover:border-white/20"
                      } ${!isLoggedIn ? "cursor-default opacity-60" : "cursor-pointer"}`}
                    >
                      <svg width="12" height="10" viewBox="0 0 12 10" fill="currentColor">
                        <polygon points="6,0 12,10 0,10" />
                      </svg>
                      <span className="text-xs font-mono font-bold leading-none">{feature.votes}</span>
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap">
                        <p className="text-nom8-text text-sm font-semibold">{feature.title}</p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${STATUS_COLORS[feature.status]}`}
                        >
                          {STATUS_LABELS[feature.status]}
                        </span>
                      </div>
                      {feature.description && (
                        <p className="text-nom8-text-muted text-xs mt-1">{feature.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {!isLoggedIn && features.length > 0 && (
        <p className="text-center text-nom8-text-muted text-xs mt-6">
          <Link href="/login" className="text-nom8-orange hover:underline">Connect</Link>{" "}
          to vote or suggest features.
        </p>
      )}
    </div>
  );
}
