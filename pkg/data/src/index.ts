import { CachedLeaderboardFetcher } from "./fetcher/cache.ts";
import { SteamWebLeaderboardFetcher } from "./fetcher/steam.ts";
import { Command } from "commander";
import { CacheLeaderboardWriter } from "./writer/cache.ts";
import { DbLeaderboardWriter } from "./writer/db.ts";

const program = new Command()
  .option(
    "--from-cache <string>",
    "Fetch leaderboard snapshot from a cached snapshot JSON"
  )
  .option(
    "--to-cache <string>",
    "Write leaderboard snapshot to a JSON file on disk"
  )
  .parse();

const opts = program.opts();

const leaderboardFetcher = opts.fromCache
  ? new CachedLeaderboardFetcher({ path: opts.fromCache })
  : new SteamWebLeaderboardFetcher({
      gameId: "2504090",
      totalScoreLeaderboardId: "16656646",
      pvpScoreLeaderboardId: "16808192",
      leaderboardSize: 200,
      leaderboardPageSize: 15,
    });

const leaderboardWriter = opts.toCache
  ? new CacheLeaderboardWriter({ path: opts.toCache })
  : new DbLeaderboardWriter();

const leaderboard = await leaderboardFetcher.fetch();
await leaderboardWriter.write(leaderboard);
