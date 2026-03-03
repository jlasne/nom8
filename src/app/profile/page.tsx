import { getHeroes } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import ProfileContent from "./ProfileContent";
import AuthForm from "./AuthForm";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const heroes = await getHeroes();

  if (!user) {
    return <AuthForm />;
  }

  return (
    <ProfileContent
      heroes={heroes}
      initialFavorites={user.favorites}
      email={user.email}
    />
  );
}
