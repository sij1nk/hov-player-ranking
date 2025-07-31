import type { SteamIdType } from "../../data/src/types.ts";

export type PlayerJson = {
  Rank: string;
  Player: string;
  ["Total rank"]: string;
  ["Pvp rank"]: string;
  ["Total score"]: string;
  ["Pvp score"]: string;
  ["Score ratio"]: string;
};

export type Player = {
  name: string;
  steamId: string;
  steamIdType: SteamIdType;
  totalRank?: number;
  totalScore?: number;
  pvpRank?: number;
  pvpScore?: number;
  scoreRatioMin: number;
  scoreRatioMax: number;
};
