import type { Hero } from "@/types/hero";
import HeroIcon from "./HeroIcon";
import RoleBadge from "./RoleBadge";

interface HeroCardProps {
  hero: Hero;
  selected?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

export default function HeroCard({
  hero,
  selected,
  onClick,
  children,
}: HeroCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-nom8-card rounded-xl border p-4 transition-all ${
        onClick ? "cursor-pointer" : ""
      } ${
        selected
          ? "border-nom8-orange/50 bg-nom8-orange/5"
          : "border-white/5 hover:border-white/10"
      }`}
    >
      <div className="flex items-center gap-3">
        <HeroIcon hero={hero} size="md" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-nom8-text truncate">{hero.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <RoleBadge role={hero.role} />
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
