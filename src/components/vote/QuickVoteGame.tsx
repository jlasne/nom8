"use client";

import { useState, useCallback, useEffect } from "react";
import type { Hero } from "@/types/hero";
import HeroCardLarge from "@/components/hero/HeroCardLarge";
import VoteOptionCard, { type Verdict } from "./VoteOptionCard";
import VoteResults from "./VoteResults";

const flavorLines = [
  "Help us learn who shuts this hero down.",
  "Who makes this hero sweat?",
  "Pick the best counter for this matchup.",
  "The crowd wants to know: who wins?",
  "Time to settle this matchup once and for all.",
];

interface QuickVoteGameProps {
  heroes: Hero[];
}

function pickRandom(heroes: Hero[]) {
  const shuffled = [...heroes].sort(() => Math.random() - 0.5);
  return {
    target: shuffled[0],
    options: shuffled.slice(1, 4),
  };
}

export default function QuickVoteGame({ heroes }: QuickVoteGameProps) {
  const [matchup, setMatchup] = useState(() => pickRandom(heroes));
  const [verdicts, setVerdicts] = useState<Record<string, Verdict>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<{
    topCounters: { slug: string; score: number; hero?: Hero }[];
  } | null>(null);
  const [flavor] = useState(
    () => flavorLines[Math.floor(Math.random() * flavorLines.length)]
  );

  const setVerdict = useCallback((heroSlug: string, verdict: Verdict) => {
    setVerdicts((prev) => ({ ...prev, [heroSlug]: verdict }));
  }, []);

  const counterCount = Object.values(verdicts).filter(
    (v) => v === "counters"
  ).length;
  const counteredCount = Object.values(verdicts).filter(
    (v) => v === "countered"
  ).length;
  const canSubmit =
    counterCount >= 1 && counteredCount >= 1 && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);

    const counterSlug = Object.entries(verdicts).find(
      ([, v]) => v === "counters"
    )?.[0];
    const getCounteredSlug = Object.entries(verdicts).find(
      ([, v]) => v === "countered"
    )?.[0];

    if (!counterSlug || !getCounteredSlug) return;

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetSlug: matchup.target.slug,
          counterSlug,
          getCounteredSlug,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResults({ topCounters: data.topCounters });
      }
    } catch {
      // Silently handle errors
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextMatchup = () => {
    setMatchup(pickRandom(heroes));
    setVerdicts({});
    setResults(null);
  };

  if (results) {
    return (
      <VoteResults
        targetName={matchup.target.name}
        topCounters={results.topCounters}
        onNextMatchup={nextMatchup}
      />
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-nom8-text mb-2">Quick Vote</h1>
        <p className="text-nom8-text-muted">
          See what the crowd knows about every matchup.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Target Hero */}
        <div>
          <p className="text-sm text-nom8-text-muted uppercase tracking-wider mb-3">
            Target Hero
          </p>
          <HeroCardLarge hero={matchup.target} subtitle={flavor} />
        </div>

        {/* Right: Option Heroes */}
        <div>
          <p className="text-sm text-nom8-text-muted uppercase tracking-wider mb-3">
            Rate these matchups
          </p>
          <div className="space-y-4">
            {matchup.options.map((hero) => (
              <VoteOptionCard
                key={hero.slug}
                hero={hero}
                targetName={matchup.target.name}
                value={verdicts[hero.slug] || "neutral"}
                onChange={(v) => setVerdict(hero.slug, v)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Submit section */}
      <div className="mt-8 text-center">
        <div className="text-sm text-nom8-text-muted mb-3">
          {counterCount === 0 && counteredCount === 0 && (
            <span>Pick at least 1 &quot;Counters&quot; and 1 &quot;Gets countered&quot;</span>
          )}
          {counterCount === 0 && counteredCount > 0 && (
            <span>Now pick 1 hero that &quot;Counters&quot; {matchup.target.name}</span>
          )}
          {counterCount > 0 && counteredCount === 0 && (
            <span>
              Now pick 1 hero that &quot;Gets countered by&quot; {matchup.target.name}
            </span>
          )}
          {canSubmit && <span>Ready to submit your vote!</span>}
        </div>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`py-3 px-10 rounded-xl font-semibold text-white transition-all ${
            canSubmit
              ? "bg-nom8-orange hover:bg-nom8-orange-light cursor-pointer"
              : "bg-white/10 text-nom8-text-muted cursor-not-allowed"
          }`}
        >
          {isSubmitting ? "Submitting..." : "Submit Vote"}
        </button>
      </div>
    </div>
  );
}
