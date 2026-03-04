import { getHeroes } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import MatchHelperContent from "./MatchHelperContent";

export default async function MatchPage() {
  const [user, heroes] = await Promise.all([getCurrentUser(), getHeroes()]);

  if (!user) {
    return (
      <div className="relative min-h-[calc(100vh-56px)]">
        <div className="blur-sm pointer-events-none select-none opacity-50" aria-hidden="true">
          <MatchHelperContent heroes={heroes} user={null} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="bg-nom8-card/90 backdrop-blur-md rounded-2xl border border-white/10 p-8 max-w-sm w-full text-center space-y-4">
            <p className="text-nom8-text font-bold text-xl">Competitive is members-only</p>
            <p className="text-nom8-text-muted text-sm">Sign in to get personalised counter picks based on your mains.</p>
            <Link href="/profile" className="block w-full py-3 bg-nom8-orange hover:bg-nom8-orange/90 text-white font-semibold rounded-xl transition-colors">
              Sign in →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <MatchHelperContent heroes={heroes} user={user} />;
}
