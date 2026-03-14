import { adminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth";
import RoadmapClient from "./RoadmapClient";

export const metadata = {
  title: "Roadmap — nom8",
  description: "Vote on upcoming features and suggest new ideas for nom8.",
};

export default async function RoadmapPage() {
  const session = await getSession();

  const { data: features } = await adminClient
    .from("roadmap_features")
    .select("id, title, description, status, votes, created_at")
    .order("votes", { ascending: false });

  let votedIds: string[] = [];
  if (session) {
    const { data: votes } = await adminClient
      .from("roadmap_votes")
      .select("feature_id")
      .eq("user_id", session.id);
    votedIds = (votes || []).map((v) => v.feature_id as string);
  }

  return (
    <RoadmapClient
      initialFeatures={features || []}
      initialVotedIds={votedIds}
      isLoggedIn={!!session}
    />
  );
}
