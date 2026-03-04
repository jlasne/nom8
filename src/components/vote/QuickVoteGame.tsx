"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import type { Hero } from "@/types/hero";
import HeroIcon from "@/components/hero/HeroIcon";
import RoleBadge from "@/components/hero/RoleBadge";

type Verdict = "counters" | "neutral" | "countered";

interface QuickVoteGameProps {
  heroes: Hero[];
  presetHeroSlug?: string;
}

interface ResultEntry {
  slug: string;
  score: number;
  hero?: Hero;
}

interface GlobalStatsEntry {
  slug: string;
  totalScore: number;
  hero: Hero | null;
}

interface GlobalStats {
  bestCounters: GlobalStatsEntry[];
  mostCountered: GlobalStatsEntry[];
}

function GlobalStatsWidget({ stats }: { stats: GlobalStats }) {
  return (
    <div className="w-full max-w-2xl mt-6">
      <p className="text-xs text-nom8-text-muted uppercase tracking-widest text-center mb-3">Global Rankings</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-nom8-card rounded-xl border border-white/5 p-3">
          <p className="text-xs text-nom8-text-muted uppercase tracking-wider mb-2 text-center">Best counters</p>
          <div className="space-y-1.5">
            {stats.bestCounters.map((e, i) =>
              e.hero ? (
                <div key={e.slug} className="flex items-center gap-2">
                  <span className="text-nom8-orange font-bold text-xs w-4">#{i + 1}</span>
                  <HeroIcon hero={e.hero} size="sm" />
                  <span className="text-nom8-text text-xs flex-1 truncate">{e.hero.name}</span>
                </div>
              ) : null
            )}
          </div>
        </div>
        <div className="bg-nom8-card rounded-xl border border-white/5 p-3">
          <p className="text-xs text-nom8-text-muted uppercase tracking-wider mb-2 text-center">Most countered</p>
          <div className="space-y-1.5">
            {stats.mostCountered.map((e, i) =>
              e.hero ? (
                <div key={e.slug} className="flex items-center gap-2">
                  <span className="text-role-damage font-bold text-xs w-4">#{i + 1}</span>
                  <HeroIcon hero={e.hero} size="sm" />
                  <span className="text-nom8-text text-xs flex-1 truncate">{e.hero.name}</span>
                </div>
              ) : null
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function pickRandom(heroes: Hero[], presetSlug?: string, maxOptions = 3) {
  const shuffled = [...heroes].sort(() => Math.random() - 0.5);
  if (presetSlug) {
    const preset = heroes.find((h) => h.slug === presetSlug);
    if (preset) {
      const rest = shuffled.filter((h) => h.slug !== presetSlug);
      return { target: preset, options: rest.slice(0, maxOptions) };
    }
  }
  return { target: shuffled[0], options: shuffled.slice(1, 1 + maxOptions) };
}

export default function QuickVoteGame({ heroes, presetHeroSlug }: QuickVoteGameProps) {
  const [matchup, setMatchup] = useState(() => pickRandom(heroes, presetHeroSlug, 4));
  const [optionIndex, setOptionIndex] = useState(0);
  const [phase, setPhase] = useState<"voting" | "results">("voting");
  const [countersMe, setCountersMe] = useState<ResultEntry[]>([]);
  const [iCounter, setICounter] = useState<ResultEntry[]>([]);
  const [voting, setVoting] = useState(false);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);

  useEffect(() => {
    fetch("/api/global-stats")
      .then((r) => r.json())
      .then((data) => setGlobalStats(data))
      .catch(() => {});
  }, []);

  const currentOption = matchup.options[optionIndex];

  const handleVote = useCallback(
    async (verdict: Verdict) => {
      if (voting) return;
      setVoting(true);
      try {
        await fetch("/api/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetSlug: matchup.target.slug,
            optionSlug: currentOption.slug,
            verdict,
          }),
        });
      } catch { /* continue */ }

      const nextIndex = optionIndex + 1;
      if (nextIndex < matchup.options.length) {
        setOptionIndex(nextIndex);
        setVoting(false);
      } else {
        try {
          const res = await fetch(`/api/matrix?hero=${matchup.target.slug}`);
          const data = await res.json();
          const heroMap = Object.fromEntries(heroes.map((h) => [h.slug, h]));
          setCountersMe((data.countersMe || []).map((e: ResultEntry) => ({ ...e, hero: heroMap[e.slug] })));
          setICounter((data.iCounter || []).map((e: ResultEntry) => ({ ...e, hero: heroMap[e.slug] })));
        } catch { /* show empty */ }
        setPhase("results");
        setVoting(false);
      }
    },
    [voting, matchup, currentOption, optionIndex, heroes]
  );

  const nextMatchup = () => {
    setMatchup(pickRandom(heroes, undefined, 3));
    setOptionIndex(0);
    setPhase("voting");
    setCountersMe([]);
    setICounter([]);
  };

  if (phase === "results") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] max-w-xl mx-auto py-8">
        <p className="text-nom8-text-muted text-sm mb-1">
          Thanks! Here&apos;s what the crowd thinks about
        </p>
        <h2 className="text-2xl font-bold text-nom8-text mb-8 flex items-center gap-3">
          <HeroIcon hero={matchup.target} size="md" />
          {matchup.target.name}
        </h2>
        <div className="grid grid-cols-2 gap-4 w-full mb-8">
          <div className="bg-nom8-card rounded-xl border border-white/5 p-4">
            <p className="text-xs text-nom8-text-muted uppercase tracking-wider mb-3 text-center">Countered by</p>
            <div className="space-y-2">
              {countersMe.slice(0, 3).map((e, i) => e.hero ? (
                <div key={e.slug} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                  <span className="text-nom8-orange font-bold text-xs w-4">#{i + 1}</span>
                  <HeroIcon hero={e.hero} size="sm" />
                  <span className="text-nom8-text text-sm flex-1 truncate">{e.hero.name}</span>
                  <span className="text-xs text-nom8-text-muted font-mono">{e.score}</span>
                </div>
              ) : null)}
              {countersMe.length === 0 && <p className="text-nom8-text-muted text-sm text-center">No data yet</p>}
            </div>
          </div>
          <div className="bg-nom8-card rounded-xl border border-white/5 p-4">
            <p className="text-xs text-nom8-text-muted uppercase tracking-wider mb-3 text-center">{matchup.target.name} counters</p>
            <div className="space-y-2">
              {iCounter.slice(0, 3).map((e, i) => e.hero ? (
                <div key={e.slug} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                  <span className="text-nom8-orange font-bold text-xs w-4">#{i + 1}</span>
                  <HeroIcon hero={e.hero} size="sm" />
                  <span className="text-nom8-text text-sm flex-1 truncate">{e.hero.name}</span>
                  <span className="text-xs text-nom8-text-muted font-mono">{e.score}</span>
                </div>
              ) : null)}
              {iCounter.length === 0 && <p className="text-nom8-text-muted text-sm text-center">No data yet</p>}
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button onClick={nextMatchup} className="flex-1 bg-nom8-orange hover:bg-nom8-orange-light text-white font-semibold py-3 px-6 rounded-xl transition-colors">
            Next matchup →
          </button>
          <Link href="/profile" className="flex-1 text-center border border-white/10 hover:bg-white/5 text-nom8-text font-semibold py-3 px-6 rounded-xl transition-colors">
            See my results →
          </Link>
        </div>
        {globalStats && <GlobalStatsWidget stats={globalStats} />}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)]">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-nom8-text mb-1">Counterwatch</h1>
          <p className="text-xs text-nom8-text-muted uppercase tracking-widest">{optionIndex + 1} of {matchup.options.length}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-nom8-card rounded-2xl border border-white/5 p-8 flex flex-col items-center gap-4">
            <p className="text-xs text-nom8-text-muted uppercase tracking-widest self-start">Target</p>
            <HeroIcon hero={matchup.target} size="xl" />
            <div className="text-center">
              <p className="text-xl font-bold text-nom8-text">{matchup.target.name}</p>
              <div className="flex justify-center mt-1"><RoleBadge role={matchup.target.role} /></div>
            </div>
          </div>
          <div className="bg-nom8-card rounded-2xl border border-white/10 p-6 flex flex-col items-center gap-3">
            <p className="text-xs text-nom8-text-muted uppercase tracking-widest self-start">vs</p>
            <HeroIcon hero={currentOption} size="xl" />
            <div className="text-center">
              <p className="text-xl font-bold text-nom8-text">{currentOption.name}</p>
              <div className="flex justify-center mt-1"><RoleBadge role={currentOption.role} /></div>
            </div>
            <div className="w-full space-y-2 mt-1">
              <button onClick={() => handleVote("counters")} disabled={voting} className="w-full py-2.5 px-3 rounded-lg border border-verdict-counter/30 bg-verdict-counter/10 text-verdict-counter hover:bg-verdict-counter/20 font-medium text-sm transition-all disabled:opacity-50">
                {currentOption.name} Counters {matchup.target.name}
              </button>
              <button onClick={() => handleVote("neutral")} disabled={voting} className="w-full py-2.5 px-3 rounded-lg border border-white/10 bg-white/5 text-nom8-text-muted hover:bg-white/10 font-medium text-sm transition-all disabled:opacity-50">
                Even matchup
              </button>
              <button onClick={() => handleVote("countered")} disabled={voting} className="w-full py-2.5 px-3 rounded-lg border border-verdict-countered/30 bg-verdict-countered/10 text-verdict-countered hover:bg-verdict-countered/20 font-medium text-sm transition-all disabled:opacity-50">
                {matchup.target.name} Counters {currentOption.name}
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-2 mt-5">
          {matchup.options.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i < optionIndex ? "bg-nom8-orange" : i === optionIndex ? "bg-nom8-orange/50" : "bg-white/10"}`} />
          ))}
        </div>
      </div>
      {globalStats && <GlobalStatsWidget stats={globalStats} />}
    </div>
  );
}
