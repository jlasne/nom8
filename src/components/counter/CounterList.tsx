import type { Hero } from "@/types/hero";
import HeroIcon from "@/components/hero/HeroIcon";
import RoleBadge from "@/components/hero/RoleBadge";

function getCounterLabel(score: number) {
  if (score >= 50) return { text: "Strong counter", color: "text-nom8-orange" };
  if (score >= 20) return { text: "Soft counter", color: "text-nom8-blue" };
  return { text: "Weak counter", color: "text-nom8-text-muted" };
}

interface CounterEntry {
  slug: string;
  score: number;
  hero?: Hero;
}

export default function CounterList({ entries }: { entries: CounterEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-nom8-text-muted py-4">
        No counter data available yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, i) => {
        const label = getCounterLabel(entry.score);
        return (
          <div
            key={entry.slug}
            className="flex items-center gap-3 bg-white/5 rounded-lg p-3"
          >
            <span className="text-lg font-bold text-nom8-orange w-6">
              {i + 1}
            </span>
            {entry.hero ? (
              <>
                <HeroIcon hero={entry.hero} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {entry.hero.name}
                  </p>
                  <RoleBadge role={entry.hero.role} />
                </div>
              </>
            ) : (
              <span className="flex-1 text-sm">{entry.slug}</span>
            )}
            <div className="text-right">
              <p className="text-xs font-mono text-nom8-text-muted">
                {entry.score} pts
              </p>
              <p className={`text-xs font-medium ${label.color}`}>
                {label.text}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
