// FIXME: prisma generated models cannot be imported on the client
// https://github.com/prisma/prisma/issues/26897
// import { type LeaderboardSnapshotModel as Snapshot } from "$lib/generated/prisma/models/LeaderboardSnapshot";
export type Snapshot = {
  id: number;
  date: Date;
  dateShort: string;
};

export type PlayerLeaderboardStats = {
  player: {
    name: string;
    steamId: string;
    steamIdType: string; // TODO: actually an enum
    profileImageId: string | null;
  };
  totalRank: number | null;
  totalScore: number | null;
  pvpRank: number | null;
  pvpScore: number | null;
  scoreRatioMin: number;
  scoreRatioMax: number;
};
