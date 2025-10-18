import type { LayoutServerLoad } from "./$types";
import type { CalendarDate } from "@internationalized/date";
import { toCalendarDate } from "$lib/date";
import { database } from "$lib/server/database";
import { error } from "@sveltejs/kit";

export const load: LayoutServerLoad = async () => {
  const response = await database
    .from("leaderboard_snapshots")
    .select("*")
    .order("dateShort", { ascending: false });

  if (response.error) {
    console.error(response.error);
    error(500, "Could not fetch list of leaderboard snapshots");
  }

  const snapshots = response.data.map((s) => ({
    id: s.id,
    date: new Date(s.date),
    dateShort: s.dateShort,
  }));

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
    snapshots: snapshots,
    snapshotCalendarDates: snapshotCalendarDates,
  };
};
