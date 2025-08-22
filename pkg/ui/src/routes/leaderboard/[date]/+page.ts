import { error } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ parent, params, data }) => {
  const { snapshots } = await parent();

  const snapshot = snapshots.find((s) => s.dateShort === params.date);

  if (!snapshot) {
    error(404, "no snapshot found");
  }

  return { snapshot, leaderboard: data.leaderboard };
};

export const ssr = false;
