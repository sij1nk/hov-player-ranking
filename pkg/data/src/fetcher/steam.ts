import type { LeaderboardFetcher } from "./index.ts";
import { parse, HTMLElement } from "node-html-parser";
import {
  type LeaderboardPlayer as SteamLeaderboardPlayer,
  type Leaderboard,
  type Player,
} from "../types.ts";
import util from "node:util";
import { SteamIdType } from "common";

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
    const totalScoreSteamLeaderboardPlayers =
      await scrapePlayersFromSteamLeaderboard(
        this._params.gameId,
        this._params.totalScoreLeaderboardId,
        this._params.leaderboardSize,
        this._params.leaderboardPageSize
      );
    const pvpScoreSteamLeaderboardPlayers =
      await scrapePlayersFromSteamLeaderboard(
        this._params.gameId,
        this._params.pvpScoreLeaderboardId,
        this._params.leaderboardSize,
        this._params.leaderboardPageSize
      );

    const players = mergeSteamLeaderboards(
      totalScoreSteamLeaderboardPlayers,
      pvpScoreSteamLeaderboardPlayers
    );

    const date = new Date();

    return {
      date: date.toISOString(),
      players,
    };
  }
}

/**
 * Scrape the list of players from a steam web leaderboard.
 *
 * @param gameId - the game's steam id
 * @param leaderboardId - the ledearboard's steam id
 * @param leaderboardSize - amount of players on the leaderboard (assuming it has a fixed size, which it does)
 * @param leaderboardPageSize - the amount of players on a page of the leaderboard (assuming it's paginated, which it is)
 * @returns the players, in the same order as they are on the leaderboard
 */
async function scrapePlayersFromSteamLeaderboard(
  gameId: string,
  leaderboardId: string,
  leaderboardSize: number,
  leaderboardPageSize: number
): Promise<SteamLeaderboardPlayer[]> {
  const urlFormatString =
    "https://steamcommunity.com/stats/%s/leaderboards/%s?sr=%d";

  const range = [
    ...Array(Math.ceil(leaderboardSize / leaderboardPageSize)),
  ].map((_, i) => i * leaderboardPageSize);

  const players = await Promise.all(
    range.map(async (r) => {
      const url = util.format(urlFormatString, gameId, leaderboardId, r + 1);
      const res = await fetch(url);
      const text = await res.text();
      let players = await scrapePlayers(parse(text));

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

  if (players.length !== leaderboardSize) {
    console.warn(
      `Expected to scrape ${leaderboardSize} players, but only found ${players.length}`
    );
  }

  return players;
}
async function scrapePlayers(
  root: HTMLElement
): Promise<SteamLeaderboardPlayer[]> {
  const stats = root.querySelector("#stats");
  if (!stats) {
    throw new Error("#stats HTML element not found");
  }

  const lbEntries = stats.querySelectorAll(".lbentry");

  return lbEntries.map((lbEntry) => {
    const rank = parseInt(querySelector(lbEntry, ".rR").innerText.slice(1), 10);
    const profileImageLink = querySelector(lbEntry, ".avatarIcon img")
      .attributes["src"];
    const profileImageId = profileImageLink.split(/\/|\./).at(-2);
    if (profileImageId === undefined) {
      throw new Error(
        `Failed to parse profile image id from profile image link '${profileImageLink}'`
      );
    }

    const playerNameElement = querySelector(lbEntry, "a.playerName");
    const profileLink = playerNameElement.attributes["href"];
    const profileLinkParts = profileLink.split("/");
    const steamId = profileLinkParts[4];
    const steamIdTypeRaw = profileLinkParts[3];
    const steamIdType = getSteamIdType(steamIdTypeRaw);
    if (!steamIdType) {
      throw new Error(`Unknown steam id type '${steamIdTypeRaw}'`);
    }
    const name = playerNameElement.innerText;
    const score = parseInt(
      querySelector(lbEntry, "div.score").innerText.replaceAll(",", ""),
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
  player: SteamLeaderboardPlayer,
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
  player: SteamLeaderboardPlayer,
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
  totalPlayer: SteamLeaderboardPlayer,
  pvpPlayer: SteamLeaderboardPlayer
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

export function mergeSteamLeaderboards(
  totalScoreLeaderboardPlayers: SteamLeaderboardPlayer[],
  pvpScoreLeaderboardPlayers: (SteamLeaderboardPlayer | null)[] // to allow splicing with null during processing
): Player[] {
  const players = [];

  // We know the leaderboards are populated and ordered
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
      .filter((p): p is SteamLeaderboardPlayer => Boolean(p))
      .map((p) => fromPvpOnlyPlayer(p, lowestTotalScore))
  );

  return players;
}

function getSteamIdType(pathSegment: string): SteamIdType | null {
  if (pathSegment === "id") return SteamIdType.Custom;
  if (pathSegment === "profiles") return SteamIdType.Id;
  return null;
}

function querySelector(element: HTMLElement, selector: string): HTMLElement {
  const ret = element.querySelector(selector);
  if (!ret) {
    throw new Error(
      `Failed to get HTML element matching selector '${selector}'`
    );
  }
  return ret;
}
