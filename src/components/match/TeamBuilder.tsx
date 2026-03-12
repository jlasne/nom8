"use client";

import type { Hero, HeroRole } from "@/types/hero";
import HeroIcon from "@/components/hero/HeroIcon";
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

function HeroIconPicker({
  heroes,
  role,
  value,
  onChange,
  excludeSlugs = [],
}: {
  heroes: Hero[];
  role: HeroRole;
  value: string | null;
  onChange: (slug: string | null) => void;
  excludeSlugs?: string[];
}) {
  const roleHeroes = heroes.filter((h) => h.role === role);
  return (
    <div className="flex flex-wrap gap-1 justify-center pt-1">
      {roleHeroes.map((h) => {
        const excluded = excludeSlugs.includes(h.slug);
        const isSelected = h.slug === value;
        return (
          <button
            key={h.slug}
            type="button"
            onClick={() => { if (!excluded) onChange(isSelected ? null : h.slug); }}
            title={h.name}
            className={`rounded-full transition-all ${
              isSelected
                ? "ring-2 ring-nom8-orange scale-110 opacity-100"
                : excluded
                  ? "opacity-15 cursor-not-allowed"
                  : "opacity-50 hover:opacity-100 hover:scale-105"
            }`}
          >
            <HeroIcon hero={h} size="sm" />
          </button>
        );
      })}
    </div>
  );
}

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
      {horizontal ? (
        <HeroIconPicker
          heroes={heroes}
          role={slot.role}
          value={team[i]}
          onChange={(slug) => {
            const next = [...team];
            next[i] = slug;
            onChange(next);
          }}
          excludeSlugs={usedSlugs.filter((s) => s !== team[i])}
        />
      ) : (
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
      )}
    </div>
  ));

  return (
    <div className="bg-nom8-card rounded-xl border border-white/5 p-6">
      <h3 className="text-lg font-bold text-nom8-text mb-1">{title}</h3>
      <p className="text-sm text-nom8-text-muted mb-4">{subtitle}</p>
      {horizontal ? (
        <div className="grid grid-cols-5 gap-1 sm:gap-3">{slots}</div>
      ) : (
        <div className="space-y-3">{slots}</div>
      )}
    </div>
  );
}
