import process from "node:process";
import { MarkdownTable2Json, JsonLayout } from "mdt2json";
import { promisify } from "node:util";
import { exec as _exec } from "node:child_process";
import type { Player } from "./types.ts";
import { playerJsonToPlayer } from "./convert.ts";
import {
  PrismaClient,
  SteamIdType,
} from "../../data/src/generated/prisma/index.js";

async function writeToDb(
  prisma: PrismaClient,
  date: Date,
  players: Player[]
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const newLeaderboardSnapshot = await tx.leaderboardSnapshot.create({
      data: {
        date,
      },
    });

    const dbPlayers = await tx.player.findMany();

    const missingPlayers = players.filter(
      (p) => !dbPlayers.some((dbp) => isSamePlayer(dbp, p))
    );

    const addedDbPlayers = await tx.player.createManyAndReturn({
      data: missingPlayers.map((p) => ({
        name: p.name,
        steamId: p.steamId,
        steamIdType: p.steamIdType,
      })),
    });

    const allDbPlayers = [...dbPlayers, ...addedDbPlayers];

    const newStats = players.map((p) => ({
      snapshotId: newLeaderboardSnapshot.id,
      playerId: allDbPlayers.find((dbp) => isSamePlayer(dbp, p))!.id,
      totalRank: p.totalRank,
      totalScore: p.totalScore,
      pvpRank: p.pvpRank,
      pvpScore: p.pvpScore,
      scoreRatioMin: p.scoreRatioMin,
      scoreRatioMax: p.scoreRatioMax,
    }));

    await tx.playerStats.createMany({ data: newStats });
  });
}

type PlayerSecondaryId = {
  steamId: string;
  steamIdType: SteamIdType;
};

function isSamePlayer(
  left: PlayerSecondaryId,
  right: PlayerSecondaryId
): boolean {
  return (
    left.steamId === right.steamId && left.steamIdType === right.steamIdType
  );
}

function arg(i: number): number | undefined {
  const s = process.argv[i];
  if (s) return Number(s);
  return undefined;
}

/**
 * Determine if an old snapshot should be migrated to the database
 *
 * @param now - the current date
 * @param snapshotDate - the snapshot creation date
 * @param daysThreshold - snapshots newer than this will always be migrated; for snapshots older than this, see `hoursToKeep`
 * @param hoursToKeep - for a snapshot older than `daysThreshold`, only migrate it if it was created at these hours (UTC)
 */
function shouldMigrateSnapshot(
  now: Date,
  snapshotDate: Date,
  daysThreshold: number,
  hoursToKeep: number[]
): boolean {
  const daysThresholdMs = daysThreshold * 24 * 60 * 60 * 1000; // * h * m * s * ms
  const threshold = new Date(now.valueOf() - daysThresholdMs);

  if (snapshotDate > threshold) return true;

  const hour = snapshotDate.getUTCHours();
  return hoursToKeep.includes(hour);
}

const exec = promisify(_exec);

const from = arg(2) ?? 0;
const count = arg(3);

const shasResult = await exec(`git log --all --oneline --grep="^Update$"`);
if (shasResult.stderr) console.error("Error: " + shasResult.stderr);
const shas = shasResult.stdout.split("\n").map((l) => l.split(" ")[0]);

const to = count ? from + count : shas.length;

const currentShas = shas.slice(from, to);

const now = new Date();

const prisma = new PrismaClient();

let i = from;
for (const sha of currentShas) {
  console.log(`Processing (${i}/${to})...`);
  i += 1;

  const dateResult = await exec(`git show ${sha} --summary --format=%ad`);
  if (dateResult.stderr) console.error("Error: " + dateResult.stderr);
  const date = new Date(dateResult.stdout.split("\n")[0]);

  if (!shouldMigrateSnapshot(now, date, 14, [0])) {
    continue;
  }

  console.log(`Migrating ${sha} (from ${date})`);

  const readmeResult = await exec(`git show ${sha}:README.md`);
  const readme = readmeResult.stdout;

  const mdTable = readme.split("<br/>")[1];

  const convert = new MarkdownTable2Json({
    markdownString: mdTable,
    includeHtml: true,
    layout: JsonLayout.AoS,
    minify: false,
  });

  const mdJsonString = convert.transform();
  const jsonString = mdJsonString.replaceAll(/```.*/g, "");
  let json;
  try {
    json = JSON.parse(jsonString);
  } catch (err) {
    console.error(
      "Failed to parse leaderboard from readme; continuing...",
      err
    );
    continue;
  }
  const players = json.map(playerJsonToPlayer);
  await writeToDb(prisma, date, players);
}
