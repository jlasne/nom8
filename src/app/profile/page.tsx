import { getHeroes } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import ProfileContent from "./ProfileContent";
import AuthForm from "./AuthForm";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const heroes = await getHeroes();

  if (!user) {
    return (
      <div className="relative min-h-[calc(100vh-56px)]">
        <div className="blur-sm pointer-events-none select-none opacity-50" aria-hidden="true">
          <ProfileContent heroes={heroes} initialFavorites={[]} email="player@nom8.gg" />
        </div>
        <div className="absolute inset-0 flex items-start justify-center pt-16 px-4">
          <AuthForm />
        </div>
      </div>
    );
  }

  return (
    <ProfileContent
      heroes={heroes}
      initialFavorites={user.favorites}
      email={user.email}
    />
  );
}
