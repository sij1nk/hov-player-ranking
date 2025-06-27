import { parse, HTMLElement } from "node-html-parser";
import { LeaderboardPlayer } from "./player.ts";

const leaderboardSize = 200;
const leaderboardPageSize = 15;

const urlBase = "https://steamcommunity.com/stats/2504090/leaderboards";

export async function fetchPlayersFromLeaderboard(
  leaderboardId: string
): Promise<LeaderboardPlayer[]> {
  const players = [];

  for (let i = 0; i < leaderboardSize; i += leaderboardPageSize) {
    const url = `${urlBase}/${leaderboardId}?sr=${i}`;
    const responseText = await fetch(url).then((res) => res.text());
    const htmlRoot = parse(responseText);

    const parsedPlayers = await parsePlayers(htmlRoot);
    players.push(...parsedPlayers);
  }

  return players;
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
      lbEntry.querySelector(".avatarIcon > a")!.attributes["href"];

    const playerNameElement = lbEntry.querySelector("a.playerName")!;
    const profileLink = playerNameElement.attributes["href"];
    const name = playerNameElement.innerText;
    const score = parseInt(
      lbEntry.querySelector("div.score")!.innerText.replaceAll(",", ""),
      10
    );

    return new LeaderboardPlayer(
      rank,
      name,
      score,
      profileLink,
      profileImageLink
    );
  });
}
