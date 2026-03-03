"use client";

import type { Hero, HeroRole } from "@/types/hero";
import HeroSelector from "@/components/hero/HeroSelector";

interface TeamSlot {
  label: string;
  role: HeroRole;
}

const teamSlots: TeamSlot[] = [
  { label: "Tank", role: "Tank" },
  { label: "Damage 1", role: "Damage" },
  { label: "Damage 2", role: "Damage" },
  { label: "Support 1", role: "Support" },
  { label: "Support 2", role: "Support" },
];

interface TeamBuilderProps {
  heroes: Hero[];
  title: string;
  subtitle: string;
  team: (string | null)[];
  onChange: (team: (string | null)[]) => void;
}

export default function TeamBuilder({
  heroes,
  title,
  subtitle,
  team,
  onChange,
}: TeamBuilderProps) {
  const usedSlugs = team.filter(Boolean) as string[];

  return (
    <div className="bg-nom8-card rounded-xl border border-white/5 p-6">
      <h3 className="text-lg font-bold text-nom8-text mb-1">{title}</h3>
      <p className="text-sm text-nom8-text-muted mb-4">{subtitle}</p>

      <div className="space-y-3">
        {teamSlots.map((slot, i) => (
          <div key={i}>
            <label className="block text-xs text-nom8-text-muted mb-1 uppercase tracking-wider">
              {slot.label}
            </label>
            <HeroSelector
              heroes={heroes}
              role={slot.role}
              value={team[i]}
              onChange={(slug) => {
                const next = [...team];
                next[i] = slug;
                onChange(next);
              }}
              excludeSlugs={usedSlugs.filter((s) => s !== team[i])}
              placeholder={`Select ${slot.role}...`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
