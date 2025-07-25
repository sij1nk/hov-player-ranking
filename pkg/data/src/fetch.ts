import { parse, HTMLElement } from "node-html-parser";
import { getSteamIdType, type LeaderboardPlayer } from "./player.ts";

const leaderboardSize = 200;
const leaderboardPageSize = 15;

const urlBase = "https://steamcommunity.com/stats/2504090/leaderboards";

export async function fetchPlayersFromLeaderboard(
  leaderboardId: string
): Promise<LeaderboardPlayer[]> {
  const range = [
    ...Array(Math.ceil(leaderboardSize / leaderboardPageSize)),
  ].map((_, i) => i * leaderboardPageSize);
  return await Promise.all(
    range.map(async (r) => {
      const url = `${urlBase}/${leaderboardId}?sr=${r + 1}`;
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
