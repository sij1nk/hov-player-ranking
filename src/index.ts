import { fetchPlayersFromLeaderboard } from "./fetch.ts";

const pvpScoreLeaderboardId = "16808192";
const totalScoreLeaderboardId = "16656646";

const totalScoreLeaderboard = await fetchPlayersFromLeaderboard(
  totalScoreLeaderboardId
);
console.log(JSON.stringify(totalScoreLeaderboard));
