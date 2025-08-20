import { client } from "$lib/server/database";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ parent, params }) => {
  const { snapshots } = await parent();

  const snapshot = snapshots.find((s) => s.dateShort === params.date);

  if (!snapshot) {
    error(404, "no snapshot found");
  }

  const leaderboard = client.playerStats.findMany({
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
  });

  return { leaderboard };
};
