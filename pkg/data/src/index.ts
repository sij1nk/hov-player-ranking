import { fetchPlayersFromLeaderboard } from "./fetch.ts";
import {
  getPlayerList,
  playerComparator,
  playerToMarkdownEntry,
} from "./player.ts";

const pvpScoreLeaderboardId = "16808192";
const totalScoreLeaderboardId = "16656646";

const totalScoreLeaderboardPlayers = await fetchPlayersFromLeaderboard(
  totalScoreLeaderboardId
);
const pvpScoreLeaderboardPlayers = await fetchPlayersFromLeaderboard(
  pvpScoreLeaderboardId
);

const players = getPlayerList(
  totalScoreLeaderboardPlayers,
  pvpScoreLeaderboardPlayers
);
players.sort(playerComparator);

const markdownEntries = players.map(playerToMarkdownEntry);

console.log(JSON.stringify(markdownEntries));
