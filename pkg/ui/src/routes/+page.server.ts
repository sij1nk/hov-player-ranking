import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ parent }) => {
  const { snapshots } = await parent();

  // TODO: sort by newest first, get [0]
  const latestSnapshot = snapshots.reduce((prev, curr) => (prev.date > curr.date ? prev : curr));

  redirect(307, `/leaderboard/${latestSnapshot.id}`);
};
