export type HeroRole = "Tank" | "Damage" | "Support";

export type HeroSubrole =
  | "Initiator"
  | "Bruiser"
  | "Stalwart"
  | "Tactician"
  | "Medic"
  | "Survivor"
  | "Specialist"
  | "Recon"
  | "Flanker"
  | "Sharpshooter";

export interface Hero {
  name: string;
  slug: string;
  role: HeroRole;
  subrole: HeroSubrole;
  isAerial: boolean;
  canShootAerial: boolean;
  hasShield: boolean;
  imageUrl?: string;
}
