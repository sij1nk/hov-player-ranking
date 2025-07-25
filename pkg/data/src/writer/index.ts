import type { Leaderboard } from "../types.ts";

export interface LeaderboardWriter {
  write(leaderboard: Leaderboard): Promise<void>;
}
