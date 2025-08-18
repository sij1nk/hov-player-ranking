import type { Snapshot } from "$lib/types";

export type NavigationHrefFn = (snapshot: Snapshot, snapshots: Snapshot[]) => Snapshot | null;

const oneDayMs = 1000 * 60 * 60 * 24;

/**
 * @param snapshot - the current snapshots
 * @param snapshots - the list of all snapshots, ordered by `dateShort` desc
 * @returns the oldest snapshot, or null if `snapshot` is the oldest
 */
export const oldest: NavigationHrefFn = (snapshot, snapshots) => {
  // NOTE: we know snapshots list to not be empty
  const oldest = snapshots.at(-1)!;
  if (snapshot.id === oldest.id) return null;
  return oldest;
};

/**
 * @param snapshot - the current snapshots
 * @param snapshots - the list of all snapshots, ordered by `dateShort` desc
 * @returns the snapshot taken closest to 24 hours ago, excluding `snapshot`;
 *   returns `null` if `snapshot` is the closest
 */
export const back24Hours: NavigationHrefFn = (snapshot, snapshots) => {
  // NOTE: we know snapshot to be among snapshots
  const i = snapshots.findIndex((s) => s.id === snapshot.id)!;
  const now = snapshots[i].date.valueOf();

  let curr = snapshots[i];
  let next = snapshots[i];
  let nextIndex = i;
  while (nextIndex < snapshots.length - 1) {
    nextIndex += 1;
    next = snapshots[nextIndex];
    const diff = now - next.date.valueOf();

    if (diff < oneDayMs) {
      curr = next;
      continue;
    }

    if (curr === snapshots[i]) {
      return next;
    }

    const currDiff = Math.abs(now - curr.date.valueOf() - oneDayMs);
    const nextDiff = Math.abs(now - next.date.valueOf() - oneDayMs);

    return currDiff < nextDiff ? curr : next;
  }

  if (i == nextIndex) return null;

  return snapshots[snapshots.length - 1];
};

/**
 * @param snapshot - the current snapshots
 * @param snapshots - the list of all snapshots, ordered by `dateShort` desc
 * @returns the snapshot previous to `snapshot`, or null if `snapshot` is the oldest
 */
export const back: NavigationHrefFn = (snapshot, snapshots) => {
  // NOTE: we know snapshot to be among snapshots
  const i = snapshots.findIndex((s) => s.id === snapshot.id)!;
  const next = i + 1;
  if (next >= snapshots.length) return null;
  return snapshots[next];
};

/**
 * @param snapshot - the current snapshots
 * @param snapshots - the list of all snapshots, ordered by `dateShort` desc
 * @returns the snapshot after `snapshot`, or null if `snapshot` is the latest
 */
export const forward: NavigationHrefFn = (snapshot, snapshots) => {
  // NOTE: we know snapshot to be among snapshots
  const i = snapshots.findIndex((s) => s.id === snapshot.id)!;
  const next = i - 1;
  if (next < 0) return null;
  return snapshots[next];
};

/**
 * @param snapshot - the current snapshots
 * @param snapshots - the list of all snapshots, ordered by `dateShort` desc
 * @returns the snapshot taken closest to 24 hours after, excluding `snapshot`;
 *   returns `null` if `snapshot` is the closest
 */
export const forward24Hours: NavigationHrefFn = (snapshot, snapshots) => {
  // NOTE: we know snapshot to be among snapshots
  const i = snapshots.findIndex((s) => s.id === snapshot.id)!;
  const now = snapshots[i].date.valueOf();

  let curr = snapshots[i];
  let next = snapshots[i];
  let nextIndex = i;
  while (nextIndex > 0) {
    nextIndex -= 1;
    next = snapshots[nextIndex];
    const diff = next.date.valueOf() - now;

    if (diff < oneDayMs) {
      curr = next;
      continue;
    }

    if (curr === snapshots[i]) {
      return next;
    }

    const currDiff = Math.abs(curr.date.valueOf() - now - oneDayMs);
    const nextDiff = Math.abs(next.date.valueOf() - now - oneDayMs);

    return currDiff < nextDiff ? curr : next;
  }

  if (i == nextIndex) return null;

  return snapshots[0];
};

/**
 * @param snapshot - the current snapshots
 * @param snapshots - the list of all snapshots, ordered by `dateShort` desc
 * @returns the latest snapshot, or null if `snapshot` is the latest
 */
export const latest: NavigationHrefFn = (snapshot, snapshots) => {
  const latest = snapshots[0];
  if (snapshot.id === latest.id) return null;
  return latest;
};
