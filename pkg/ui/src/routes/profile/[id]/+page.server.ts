import type { PageServerLoad } from "./$types";
import { convertPlayer } from "$lib/components/player-profile/player";
import { database } from "$lib/server/database";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params, setHeaders }) => {
  const steamId = params.id;

  const player = database
    .from("players")
    .select(
      `
    id,
    steamId,
    steamIdType,
    name,
    profileImageId,
    stats:player_stats (
      id,
      playerId,
      totalRank,
      totalScore,
      pvpRank,
      pvpScore,
      scoreRatioMin,
      scoreRatioMax,
      snapshotId,
      snapshot:leaderboard_snapshots (
        id,
        date
      )
    )
`,
    )
    .filter("steamId", "eq", steamId)
    .then((response) => {
      if (response.error) {
        console.error(response.error);
        error(500, "Could not fetch player");
      }

      const player = response.data?.[0];

      if (!player) return null;
      return convertPlayer(player);
    });

  setHeaders({
    "Cache-Control": "max-age=3600",
  });

  return { player };
};
