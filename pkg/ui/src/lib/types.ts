// FIXME: prisma generated models cannot be imported on the client
// https://github.com/prisma/prisma/issues/26897
// import { type LeaderboardSnapshotModel as Snapshot } from "$lib/generated/prisma/models/LeaderboardSnapshot";
export type Snapshot = {
  id: number;
  date: Date;
  dateShort: string;
};
