import type { Leaderboard } from "../types.ts";
import type { LeaderboardWriter } from "./index.ts";
import fs from "node:fs/promises";

export type CacheLeaderboardWriterParams = {
  path: string;
};

export class CacheLeaderboardWriter implements LeaderboardWriter {
  constructor(private readonly _params: CacheLeaderboardWriterParams) {}

  public async write(leaderboard: Leaderboard): Promise<void> {
    const json = JSON.stringify(leaderboard);

    await fs.writeFile(this._params.path, json, "utf-8");
  }
}
