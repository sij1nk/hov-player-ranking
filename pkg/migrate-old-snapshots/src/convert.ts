import type { PlayerStats } from "../../data/src/generated/prisma/index.js";
import { SteamIdType } from "../../data/src/types.ts";

export function playerJsonToPlayer(playerJson: PlayerJson): Player {
	const totalRank = maybeNumber(playerJson["Total rank"]);
	const totalScore = maybeNumber(playerJson["Total score"]);
	const pvpRank = maybeNumber(playerJson["Pvp rank"]);
	const pvpScore = maybeNumber(playerJson["Pvp score"]);
	const [scoreRatioMin, scoreRatioMax] = getScoreRatioMinMax(
		playerJson["Score ratio"],
	);

	const stats: PlayerStats = {
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
	// "<a href=\"https://steamcommunity.com/profiles/76561198129807195/stats/2504090/\">Katerlysator</a>"
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

function maybeNumber(field: string): number | null {
	if (!field.length) return null;
	return Number(field);
}
