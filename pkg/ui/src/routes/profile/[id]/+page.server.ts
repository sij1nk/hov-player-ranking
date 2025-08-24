import type { PageServerLoad } from "./$types";
import { client } from "$lib/server/database";
import { convertPlayer } from "$lib/components/player-profile/player";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ params, setHeaders }) => {
  const steamId = params.id;

  const player = client.player
    .findFirst({
      where: { steamId: steamId },
      include: {
        stats: {
          include: {
            snapshot: { omit: { dateShort: true, id: true } },
          },
          omit: { id: true, playerId: true, snapshotId: true },
        },
      },
      omit: { id: true },
    })
    .then((player) => {
      if (!player) error(404, "Player does not exist");
      // FIXME: tsc is being stupid (this is fine)
      return convertPlayer(player);
    });

  setHeaders({
    "Cache-Control": "max-age=3600",
  });

  return { player };
};
