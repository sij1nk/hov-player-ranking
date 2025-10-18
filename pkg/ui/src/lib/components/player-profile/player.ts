import type { SteamIdType } from "common";

export type PlayerDTO = {
  name: string;
  steamId: string;
  steamIdType: SteamIdType;
  profileImageId: string | null;
  stats: {
    totalRank: number | null;
    totalScore: number | null;
    pvpRank: number | null;
    pvpScore: number | null;
    scoreRatioMin: number;
    scoreRatioMax: number;
    snapshot: {
      date: Date;
    };
  }[];
};

export type PlayerStats = {
  totalRank: number | null;
  totalScore: number | null;
  pvpRank: number | null;
  pvpScore: number | null;
  scoreRatioMin: number;
  scoreRatioMax: number;
  date: Date;
};

// TODO: could we query it this way from the DB?
export type Player = {
  name: string;
  steamId: string;
  steamIdType: SteamIdType;
  profileImageId: string | null;
  stats: PlayerStats[];
};

export const convertPlayer = (p: PlayerDTO): Player => {
  const stats = p.stats
    .map((s) => ({
      totalRank: s.totalRank,
      totalScore: s.totalScore,
      pvpRank: s.pvpRank,
      pvpScore: s.pvpScore,
      scoreRatioMin: s.scoreRatioMin,
      scoreRatioMax: s.scoreRatioMax,
      date: new Date(s.snapshot.date),
    }))
    .sort((left, right) => left.date.valueOf() - right.date.valueOf());
  return {
    ...p,
    stats,
  };
};

export const firstStatsPerDay = (stats: PlayerStats[]): PlayerStats[] => {
  let current: string | null = null;
  return stats.filter((s) => {
    const d = s.date.toLocaleDateString();
    if (current != d) {
      current = d;
      return true;
    }
    return false;
  });
};
