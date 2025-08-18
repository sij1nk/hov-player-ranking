import type { LayoutServerLoad } from "./$types";
import { client } from "$lib/server/database";

export const load: LayoutServerLoad = async () => {
  const snapshots = await client.leaderboardSnapshot.findMany({ orderBy: { dateShort: "desc" } });
  // TODO: custom error page for when the database cannot be reached
  return {
    snapshots,
  };
};
