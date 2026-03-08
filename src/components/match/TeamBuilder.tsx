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
  horizontal?: boolean;
}

export default function TeamBuilder({
  heroes,
  title,
  subtitle,
  team,
  onChange,
  horizontal = false,
}: TeamBuilderProps) {
  const usedSlugs = team.filter(Boolean) as string[];

  const slots = teamSlots.map((slot, i) => (
    <div key={i}>
      <label className={`block text-xs text-nom8-text-muted mb-1 uppercase tracking-wider ${horizontal ? "text-center" : ""}`}>
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
  ));

  return (
    <div className="bg-nom8-card rounded-xl border border-white/5 p-6">
      <h3 className="text-lg font-bold text-nom8-text mb-1">{title}</h3>
      <p className="text-sm text-nom8-text-muted mb-4">{subtitle}</p>
      {horizontal ? (
        <div className="grid grid-cols-5 gap-3">{slots}</div>
      ) : (
        <div className="space-y-3">{slots}</div>
      )}
    </div>
  );
}
