export interface User {
  id: string;
  email: string;
  favorites: string[]; // hero slugs
  isPaid: boolean;
}
