import process from "node:process";
import { MarkdownTable2Json, JsonLayout } from "mdt2json";
import { promisify } from "node:util";
import { exec as _exec } from "node:child_process";
import type { Player } from "./types.ts";
import { playerJsonToPlayer } from "./convert.ts";
import { PrismaClient } from "../../data/src/generated/prisma/index.js";

async function writeToDb(date: string, players: Player[]): Promise<void> {
  const prisma = new PrismaClient();

  await prisma.$transaction(async (tx) => {
    const newLeaderboardSnapshot = await tx.leaderboardSnapshot.create({
      data: {
        date,
      },
    });

    const upsertPlayerPromises = players.map((p) => {
      const newStats = {
        snapshotId: newLeaderboardSnapshot.id,
        totalRank: p.totalRank,
        totalScore: p.totalScore,
        pvpRank: p.pvpRank,
        pvpScore: p.pvpScore,
        scoreRatioMin: p.scoreRatioMin,
        scoreRatioMax: p.scoreRatioMax,
      };

      return tx.player.upsert({
        where: {
          steamId: p.steamId,
          steamIdType: p.steamIdType,
        },
        update: {
          name: p.name,
          stats: {
            create: newStats,
          },
        },
        create: {
          name: p.name,
          steamId: p.steamId,
          steamIdType: p.steamIdType,
          stats: {
            create: newStats,
          },
        },
        include: {
          stats: true,
        },
      });
    });

    await Promise.all(upsertPlayerPromises);
  });
}

function arg(i: number): number | undefined {
  const s = process.argv[i];
  if (s) return Number(s);
  return undefined;
}

const exec = promisify(_exec);

const from = arg(2) ?? 0;
const count = arg(3);

const shasResult = await exec(`git log --all --oneline --grep="^Update$"`);
if (shasResult.stderr) console.error("Error: " + shasResult.stderr);
const shas = shasResult.stdout.split("\n").map((l) => l.split(" ")[0]);

const to = count ? from + count : shas.length;

const currentShas = shas.slice(from, to);

let i = from;
for (const sha of currentShas) {
  console.log(`Processing (${i}/${to})...`);
  i += 1;

  const readmeResult = await exec(`git show ${sha}:README.md`);
  const dateResult = await exec(`git show ${sha} --summary --format=%ad`);

  if (readmeResult.stderr) console.error("Error: " + readmeResult.stderr);
  const readme = readmeResult.stdout;
  const date = new Date(dateResult.stdout.split("\n")[0]).toISOString();

  const mdTable = readme.split("<br/>")[1];

  const convert = new MarkdownTable2Json({
    markdownString: mdTable,
    includeHtml: true,
    layout: JsonLayout.AoS,
    minify: false,
  });

  const mdJsonString = convert.transform();
  const jsonString = mdJsonString.replaceAll(/```.*/g, "");
  const json = JSON.parse(jsonString);
  const players = json.map(playerJsonToPlayer);
  await writeToDb(date, players);
}
