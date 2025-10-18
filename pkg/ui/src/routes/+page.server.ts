import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ parent }) => {
  const { snapshots } = await parent();

  const latestSnapshot = snapshots[0];

  redirect(307, `/leaderboard/${latestSnapshot.dateShort}`);
};
