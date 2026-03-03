// Counter matrix: matrix[counterHeroSlug][targetHeroSlug] = score
// A positive score means the counter hero is effective against the target hero.
export type CounterMatrix = Record<string, Record<string, number>>;
