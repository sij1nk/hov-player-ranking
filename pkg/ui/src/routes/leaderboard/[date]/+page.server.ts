import { client } from "$lib/server/database";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ parent, params, setHeaders }) => {
  const { snapshots } = await parent();

  const snapshot = snapshots.find((s) => s.dateShort === params.date);

  if (!snapshot) {
    error(404, "Could not find leaderboard snapshot");
  }

  const leaderboard = client.playerStats
    .findMany({
      where: { snapshotId: snapshot.id },
      omit: {
        id: true,
        playerId: true,
        snapshotId: true,
      },
      include: {
        player: {
          omit: {
            id: true,
          },
        },
      },
    })
    .then((leaderboard) => {
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
