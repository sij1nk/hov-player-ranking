import type { Leaderboard } from "../types.ts";

export interface LeaderboardFetcher {
  fetch(): Promise<Leaderboard>;
}
