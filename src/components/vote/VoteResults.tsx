import type { Hero } from "@/types/hero";
import HeroCard from "@/components/hero/HeroCard";

interface VoteResultsProps {
  targetName: string;
  topCounters: { slug: string; score: number; hero?: Hero }[];
  onNextMatchup: () => void;
}

export default function VoteResults({
  targetName,
  topCounters,
  onNextMatchup,
}: VoteResultsProps) {
  return (
    <div className="bg-nom8-card rounded-2xl border border-white/5 p-8 text-center">
      <p className="text-nom8-text-muted text-sm mb-2">
        Thanks! Here&apos;s what the crowd thinks:
      </p>
      <h3 className="text-xl font-bold text-nom8-text mb-6">
        Top counters for {targetName}
      </h3>

      <div className="space-y-3 mb-8 max-w-md mx-auto">
        {topCounters.map((entry, i) => (
          <div
            key={entry.slug}
            className="flex items-center gap-4 bg-white/5 rounded-lg p-3"
          >
            <span className="text-2xl font-bold text-nom8-orange w-8">
              #{i + 1}
            </span>
            {entry.hero ? (
              <div className="flex-1 text-left">
                <HeroCard hero={entry.hero} />
              </div>
            ) : (
              <span className="flex-1 text-left text-nom8-text">
                {entry.slug}
              </span>
            )}
            <span className="text-sm text-nom8-text-muted font-mono">
              {entry.score} pts
            </span>
          </div>
        ))}
        {topCounters.length === 0 && (
          <p className="text-nom8-text-muted">No counter data yet!</p>
        )}
      </div>

      <button
        onClick={onNextMatchup}
        className="bg-nom8-orange hover:bg-nom8-orange-light text-white font-semibold py-3 px-8 rounded-xl transition-colors"
      >
        Next matchup
      </button>
    </div>
  );
}
