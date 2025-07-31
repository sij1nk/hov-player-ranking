import process from "node:process";
import type { Player, PlayerJson } from "./types.ts";
import { playerJsonToPlayer } from "./convert.ts";
import { PrismaClient } from "../../data/src/generated/prisma/index.js";

async function readStdin(): Promise<string> {
  return new Promise((res) => {
    const stdin = process.stdin;
    const chunks: string[] = [];

    stdin.on("readable", () => {
      let chunk;
      while (null !== (chunk = stdin.read())) {
        chunks.push(chunk);
      }
    });

    stdin.on("end", () => {
      const content = chunks.join("");
      res(content);
    });
  });
}

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

const input = await readStdin();
const lines = input.split("\n");
const date = new Date(lines[0]).toISOString();
const json = lines.slice(1).join("\n");
const jsonPlayers: PlayerJson[] = JSON.parse(json);
const players = jsonPlayers.map(playerJsonToPlayer);

await writeToDb(date, players);
