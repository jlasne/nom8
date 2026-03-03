"use client";

import { useState, useEffect } from "react";
import type { Hero } from "@/types/hero";
import CounterList from "./CounterList";
import HeroIcon from "@/components/hero/HeroIcon";

interface CounterPanelProps {
  hero: Hero;
}

interface CounterEntry {
  slug: string;
  score: number;
  hero?: Hero;
}

export default function CounterPanel({ hero }: CounterPanelProps) {
  const [tab, setTab] = useState<"iCounter" | "countersMe">("iCounter");
  const [data, setData] = useState<{
    iCounter: CounterEntry[];
    countersMe: CounterEntry[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/matrix?hero=${hero.slug}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [hero.slug]);

  return (
    <div className="bg-nom8-card rounded-xl border border-white/5 p-6">
      <div className="flex items-center gap-3 mb-4">
        <HeroIcon hero={hero} size="lg" />
        <div>
          <h3 className="text-lg font-bold">{hero.name}</h3>
          <p className="text-sm text-nom8-text-muted">{hero.role} / {hero.subrole}</p>
        </div>
      </div>

      <div className="flex gap-1 mb-4">
        <button
          onClick={() => setTab("iCounter")}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            tab === "iCounter"
              ? "bg-nom8-orange/10 text-nom8-orange"
              : "text-nom8-text-muted hover:bg-white/5"
          }`}
        >
          I counter
        </button>
        <button
          onClick={() => setTab("countersMe")}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            tab === "countersMe"
              ? "bg-role-damage/10 text-role-damage"
              : "text-nom8-text-muted hover:bg-white/5"
          }`}
        >
          Counters me
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-nom8-text-muted text-sm">
          Loading matchup data...
        </div>
      ) : data ? (
        <CounterList
          entries={tab === "iCounter" ? data.iCounter : data.countersMe}
        />
      ) : (
        <p className="text-sm text-nom8-text-muted">Failed to load data.</p>
      )}
    </div>
  );
}
