import type { LayoutServerLoad } from "./$types";
import { client } from "$lib/server/database";

export const load: LayoutServerLoad = async () => {
  const snapshots = await client.leaderboardSnapshot.findMany({ orderBy: { dateShort: "desc" } });
  return {
    snapshots,
  };
};
