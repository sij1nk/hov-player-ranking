import { SteamIdType } from "../../data/src/types.ts";
import type { PlayerJson, Player } from "./types.ts";

export function playerJsonToPlayer(playerJson: PlayerJson): Player {
  const totalRank = maybeNumber(playerJson["Total rank"]);
  const totalScore = maybeNumber(playerJson["Total score"]);
  const pvpRank = maybeNumber(playerJson["Pvp rank"]);
  const pvpScore = maybeNumber(playerJson["Pvp score"]);
  const [scoreRatioMin, scoreRatioMax] = getScoreRatioMinMax(
    playerJson["Score ratio"]
  );

  const { name, steamId, steamIdType } = parsePlayerInformation(
    playerJson["Player"]
  );

  return {
    name,
    steamId,
    steamIdType,
    totalRank,
    totalScore,
    pvpRank,
    pvpScore,
    scoreRatioMin,
    scoreRatioMax,
  };
}

function getSteamIdType(pathSegment: string): SteamIdType | null {
  if (pathSegment === "id") return SteamIdType.Custom;
  if (pathSegment === "profiles") return SteamIdType.Id;
  return null;
}

function parsePlayerInformation(field: string): {
  name: string;
  steamId: string;
  steamIdType: SteamIdType;
} {
  const profileLink = field.match(/".*"/)![0];
  const profileLinkParts = profileLink.split("/");
  const steamId = profileLinkParts[4];
  const steamIdType = getSteamIdType(profileLinkParts[3])!;
  const name = field.match(/>(.*)</)![1];

  return { name, steamId, steamIdType };
}

function getScoreRatioMinMax(field: string): [number, number] {
  const split = field.split(" - ");
  if (split.length === 1) {
    const n = Number(split[0]);
    return [n, n];
  }
  const min = Number(split[0]);
  const max = Number(split[1]);
  return [min, max];
}

function maybeNumber(field: string): number | undefined {
  if (!field.length) return undefined;
  return Number(field);
}
