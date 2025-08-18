import type { LayoutServerLoad } from "./$types";
import { client } from "$lib/server/database";
import type { CalendarDate } from "@internationalized/date";
import { toCalendarDate } from "$lib/date";

export const load: LayoutServerLoad = async () => {
  const snapshots = await client.leaderboardSnapshot.findMany({ orderBy: { dateShort: "desc" } });

  // TODO: error if no snapshots

  const snapshotCalendarDates: CalendarDate[] = [toCalendarDate(snapshots[0].date)];
  for (const snapshot of snapshots.slice(1)) {
    const date = toCalendarDate(snapshot.date);
    const last = snapshotCalendarDates.at(-1)!;

    if (date.compare(last) === 0) {
      continue;
    }
    snapshotCalendarDates.push(date);
  }

  // TODO: custom error page for when the database cannot be reached
  return {
    snapshots,
    snapshotCalendarDates: snapshotCalendarDates,
  };
};
