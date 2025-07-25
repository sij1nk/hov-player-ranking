import type { Leaderboard } from "../types.ts";
import type { LeaderboardFetcher } from "./index.ts";
import fs from "node:fs/promises";

export type CachedLeaderboardFetcherParams = {
  path: string;
};

export class CachedLeaderboardFetcher implements LeaderboardFetcher {
  constructor(private readonly _params: CachedLeaderboardFetcherParams) {}

  public async fetch(): Promise<Leaderboard> {
    const fileContents = await fs.readFile(this._params.path, "utf-8");
    // It is assumed that the input file fits the schema
    const leaderboard = JSON.parse(fileContents) as Leaderboard;

    return leaderboard;
  }
}
