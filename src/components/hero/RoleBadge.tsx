import type { HeroRole } from "@/types/hero";

const roleStyles: Record<HeroRole, string> = {
  Tank: "bg-role-tank/15 text-role-tank border-role-tank/20",
  Damage: "bg-role-damage/15 text-role-damage border-role-damage/20",
  Support: "bg-role-support/15 text-role-support border-role-support/20",
};

export default function RoleBadge({ role }: { role: HeroRole }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${roleStyles[role]}`}
    >
      {role}
    </span>
  );
}
