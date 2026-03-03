import type { Hero } from "@/types/hero";
import HeroIcon from "./HeroIcon";
import RoleBadge from "./RoleBadge";

interface HeroCardLargeProps {
  hero: Hero;
  subtitle?: string;
}

export default function HeroCardLarge({ hero, subtitle }: HeroCardLargeProps) {
  return (
    <div className="bg-nom8-card rounded-2xl border border-white/5 p-8 text-center">
      <div className="flex justify-center mb-4">
        <HeroIcon hero={hero} size="xl" />
      </div>
      <h2 className="text-2xl font-bold text-nom8-text mb-2">{hero.name}</h2>
      <div className="flex items-center justify-center gap-2 mb-3">
        <RoleBadge role={hero.role} />
        <span className="text-sm text-nom8-text-muted">{hero.subrole}</span>
      </div>
      <div className="flex items-center justify-center gap-3 text-xs text-nom8-text-muted">
        {hero.isAerial && (
          <span className="bg-white/5 px-2 py-1 rounded">Aerial</span>
        )}
        {hero.hasShield && (
          <span className="bg-white/5 px-2 py-1 rounded">Shield</span>
        )}
      </div>
      {subtitle && (
        <p className="mt-4 text-sm text-nom8-text-muted italic">{subtitle}</p>
      )}
    </div>
  );
}
