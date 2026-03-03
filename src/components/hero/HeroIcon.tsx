import type { Hero, HeroRole } from "@/types/hero";

const roleColors: Record<HeroRole, string> = {
  Tank: "bg-role-tank",
  Damage: "bg-role-damage",
  Support: "bg-role-support",
};

const roleBorders: Record<HeroRole, string> = {
  Tank: "ring-role-tank/30",
  Damage: "ring-role-damage/30",
  Support: "ring-role-support/30",
};

const sizes = {
  sm: "w-8 h-8 text-xs",
  md: "w-12 h-12 text-sm",
  lg: "w-20 h-20 text-xl",
  xl: "w-28 h-28 text-3xl",
};

interface HeroIconProps {
  hero: Hero;
  size?: keyof typeof sizes;
}

export default function HeroIcon({ hero, size = "md" }: HeroIconProps) {
  const initials = hero.name
    .split(/[\s.]+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (hero.imageUrl) {
    return (
      <div
        className={`${sizes[size]} rounded-full ring-2 ${roleBorders[hero.role]} overflow-hidden flex-shrink-0`}
      >
        <img
          src={hero.imageUrl}
          alt={hero.name}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizes[size]} ${roleColors[hero.role]} rounded-full flex items-center justify-center font-bold text-white ring-2 ${roleBorders[hero.role]} flex-shrink-0`}
    >
      {initials}
    </div>
  );
}
