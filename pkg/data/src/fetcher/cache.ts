import type { Leaderboard } from "../types.ts";
import type { LeaderboardFetcher } from "./index.ts";

export type CachedLeaderboardFetcherParams = {
  path: string;
};

export class CachedLeaderboardFetcher implements LeaderboardFetcher {
  constructor(private readonly _params: CachedLeaderboardFetcherParams) {}

  fetch(): Promise<Leaderboard> {
    throw new Error("Method not implemented.");
  }
}
