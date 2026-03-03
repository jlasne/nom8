"use client";

import type { Hero } from "@/types/hero";
import HeroIcon from "@/components/hero/HeroIcon";
import RoleBadge from "@/components/hero/RoleBadge";

export type Verdict = "counters" | "neutral" | "countered";

interface VoteOptionCardProps {
  hero: Hero;
  targetName: string;
  value: Verdict;
  onChange: (verdict: Verdict) => void;
}

const verdictOptions: {
  value: Verdict;
  getLabel: (targetName: string) => string;
  activeClass: string;
}[] = [
  {
    value: "counters",
    getLabel: (t) => `Counters ${t}`,
    activeClass: "border-verdict-counter bg-verdict-counter/10 text-verdict-counter",
  },
  {
    value: "neutral",
    getLabel: () => "Neutral",
    activeClass: "border-verdict-neutral bg-verdict-neutral/10 text-verdict-neutral",
  },
  {
    value: "countered",
    getLabel: (t) => `Gets countered by ${t}`,
    activeClass: "border-verdict-countered bg-verdict-countered/10 text-verdict-countered",
  },
];

export default function VoteOptionCard({
  hero,
  targetName,
  value,
  onChange,
}: VoteOptionCardProps) {
  return (
    <div className="bg-nom8-card rounded-xl border border-white/5 p-5">
      <div className="flex items-center gap-3 mb-4">
        <HeroIcon hero={hero} size="lg" />
        <div>
          <p className="text-lg font-semibold text-nom8-text">{hero.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <RoleBadge role={hero.role} />
            <span className="text-xs text-nom8-text-muted">{hero.subrole}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {verdictOptions.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                isActive
                  ? opt.activeClass
                  : "border-white/5 text-nom8-text-muted hover:border-white/10 hover:bg-white/5"
              }`}
            >
              {opt.getLabel(targetName)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
