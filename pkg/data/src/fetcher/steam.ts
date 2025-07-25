import type { LeaderboardFetcher } from "./index.ts";
import { parse, HTMLElement } from "node-html-parser";
import {
  type LeaderboardPlayer,
  type Leaderboard,
  type Player,
  SteamIdType,
} from "../types.ts";
import util from "node:util";

export type SteamWebLeaderboardFetcherParams = {
  gameId: string;
  totalScoreLeaderboardId: string;
  pvpScoreLeaderboardId: string;
  leaderboardSize: number;
  leaderboardPageSize: number;
};

export class SteamWebLeaderboardFetcher implements LeaderboardFetcher {
  constructor(private readonly _params: SteamWebLeaderboardFetcherParams) {}

  public async fetch(): Promise<Leaderboard> {
    const totalScoreLeaderboardPlayers = await fetchPlayersFromLeaderboard(
      this._params.gameId,
      this._params.totalScoreLeaderboardId,
      this._params.leaderboardSize,
      this._params.leaderboardPageSize
    );
    const pvpScoreLeaderboardPlayers = await fetchPlayersFromLeaderboard(
      this._params.gameId,
      this._params.pvpScoreLeaderboardId,
      this._params.leaderboardSize,
      this._params.leaderboardPageSize
    );

    const players = getPlayerList(
      totalScoreLeaderboardPlayers,
      pvpScoreLeaderboardPlayers
    );

    const date = new Date();

    return {
      date: date.toISOString(),
      players,
    };
  }
}

async function fetchPlayersFromLeaderboard(
  gameId: string,
  leaderboardId: string,
  leaderboardSize: number,
  leaderboardPageSize: number
): Promise<LeaderboardPlayer[]> {
  const urlFormatString =
    "https://steamcommunity.com/stats/%s/leaderboards/%s?sr=%d";

  const range = [
    ...Array(Math.ceil(leaderboardSize / leaderboardPageSize)),
  ].map((_, i) => i * leaderboardPageSize);
  return await Promise.all(
    range.map(async (r) => {
      const url = util.format(urlFormatString, gameId, leaderboardId, r + 1);
      const res = await fetch(url);
      const text = await res.text();
      let players = await parsePlayers(parse(text));

      // steam always shows `leaderboardPageSize` entries per page, so we may
      // need to throw away some entries from the last page
      const entriesToDiscardFromBeginning =
        r + leaderboardPageSize - leaderboardSize;
      if (entriesToDiscardFromBeginning > 0) {
        players = players.slice(entriesToDiscardFromBeginning);
      }

      return players;
    })
  ).then((arr) => arr.flat());
}

async function parsePlayers(root: HTMLElement): Promise<LeaderboardPlayer[]> {
  const stats = root.querySelector("#stats");
  if (!stats) {
    throw new Error("#stats not found");
  }

  const lbEntries = stats.querySelectorAll(".lbentry");

  return lbEntries.map((lbEntry) => {
    const rank = parseInt(lbEntry.querySelector(".rR")!.innerText.slice(1), 10);
    const profileImageLink =
      lbEntry.querySelector(".avatarIcon img")!.attributes["src"];
    const profileImageId = profileImageLink.split(/\/|\./).at(-2)!;

    const playerNameElement = lbEntry.querySelector("a.playerName")!;
    const profileLink = playerNameElement.attributes["href"];
    const profileLinkParts = profileLink.split("/");
    const steamId = profileLinkParts[4];
    const steamIdType = getSteamIdType(profileLinkParts[3])!;
    const name = playerNameElement.innerText;
    const score = parseInt(
      lbEntry.querySelector("div.score")!.innerText.replaceAll(",", ""),
      10
    );

    return {
      rank,
      name,
      score,
      steamId,
      steamIdType,
      profileImageId,
    };
  });
}

function fromPvpOnlyPlayer(
  player: LeaderboardPlayer,
  maxTotalScore: number
): Player {
  const { rank, score, ...rest } = player;
  return {
    ...rest,
    pvpRank: rank,
    pvpScore: score,
    scoreRatio: { _type: "unknown", min: player.score / maxTotalScore, max: 1 },
  };
}

function fromTotalOnlyPlayer(
  player: LeaderboardPlayer,
  maxPvpScore: number
): Player {
  const { rank, score, ...rest } = player;
  return {
    ...rest,
    totalRank: rank,
    totalScore: score,
    scoreRatio: { _type: "unknown", min: 0, max: maxPvpScore / player.score },
  };
}

function fromPlayerOnBothLeaderboards(
  totalPlayer: LeaderboardPlayer,
  pvpPlayer: LeaderboardPlayer
): Player {
  const { rank, score, ...rest } = totalPlayer;
  return {
    ...rest,
    totalRank: rank,
    totalScore: score,
    pvpRank: pvpPlayer.rank,
    pvpScore: pvpPlayer.score,
    scoreRatio: { _type: "known", value: pvpPlayer.score / totalPlayer.score },
  };
}

export function getPlayerList(
  totalScoreLeaderboardPlayers: LeaderboardPlayer[],
  pvpScoreLeaderboardPlayers: (LeaderboardPlayer | null)[]
): Player[] {
  const players = [];

  const lowestTotalScore = totalScoreLeaderboardPlayers.at(-1)!.score;
  const lowestPvpScore = pvpScoreLeaderboardPlayers.at(-1)!.score;

  for (const player of totalScoreLeaderboardPlayers) {
    const pvpPlayerIndex = pvpScoreLeaderboardPlayers.findIndex(
      (p) => p?.name === player.name
    );
    if (pvpPlayerIndex < 0) {
      players.push(fromTotalOnlyPlayer(player, lowestPvpScore));
    } else {
      const pvpPlayer = pvpScoreLeaderboardPlayers.splice(
        pvpPlayerIndex,
        1,
        null
      )[0];
      if (!pvpPlayer) {
        throw new Error(
          `Tried to retrieve ${player.name} twice from pvp leaderboard`
        );
      }
      players.push(fromPlayerOnBothLeaderboards(player, pvpPlayer));
    }
  }

  players.push(
    ...pvpScoreLeaderboardPlayers
      .filter((p): p is LeaderboardPlayer => Boolean(p))
      .map((p) => fromPvpOnlyPlayer(p, lowestTotalScore))
  );

  return players;
}

function getSteamIdType(pathSegment: string): SteamIdType | null {
  if (pathSegment === "id") return SteamIdType.Custom;
  if (pathSegment === "profiles") return SteamIdType.Id;
  return null;
}
