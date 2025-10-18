import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { database } from "$lib/server/database";

export const load: PageServerLoad = async ({ parent, params, setHeaders }) => {
  const { snapshots } = await parent();

  const snapshot = snapshots.find((s) => s.dateShort === params.date);

  if (!snapshot) {
    error(404, "Could not find leaderboard snapshot");
  }

  const leaderboard = database
    .from("player_stats")
    .select(
      `
      totalRank,
      totalScore,
      pvpRank,
      pvpScore,
      scoreRatioMin,
      scoreRatioMax,
      playerId,
      player:players (
        id,
        steamId,
        steamIdType,
        name,
        profileImageId
      )
`,
    )
    .filter("snapshotId", "eq", snapshot.id)
    .then((response) => {
      if (response.error) {
        console.error(response.error);
        error(500, "Could not fetch leaderboard snapshot");
      }

      const leaderboard = response.data;

      if (!leaderboard.length) {
        error(500, "Leaderboard has 0 entries");
      }
      return leaderboard;
    });

  // leaderboard snapshots are cachable forever
  setHeaders({
    "Cache-Control": "max-age=31536000",
  });

  return { leaderboard };
};
