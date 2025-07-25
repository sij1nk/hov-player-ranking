import { PrismaClient } from "../generated/prisma/index.js";
import type { Leaderboard } from "../types.ts";
import type { LeaderboardWriter } from "./index.ts";

export class DbLeaderboardWriter implements LeaderboardWriter {
  public async write(leaderboard: Leaderboard): Promise<void> {
    const prisma = new PrismaClient();

    await prisma.$transaction(async (tx) => {
      const newLeaderboardSnapshot = await tx.leaderboardSnapshot.create({
        data: {
          date: leaderboard.date,
        },
      });

      const upsertPlayerPromises = leaderboard.players.map((p) => {
        const newStats = {
          snapshotId: newLeaderboardSnapshot.id,
          totalRank: p.totalRank,
          totalScore: p.totalScore,
          pvpRank: p.pvpRank,
          pvpScore: p.pvpScore,
          scoreRatioMin:
            p.scoreRatio._type === "known"
              ? p.scoreRatio.value
              : p.scoreRatio.min,
          scoreRatioMax:
            p.scoreRatio._type === "known"
              ? p.scoreRatio.value
              : p.scoreRatio.max,
        };

        return tx.player.upsert({
          where: {
            steamId: p.steamId,
            steamIdType: p.steamIdType,
          },
          update: {
            name: p.name,
            profileImageId: p.profileImageId,
            stats: {
              create: newStats,
            },
          },
          create: {
            name: p.name,
            steamId: p.steamId,
            steamIdType: p.steamIdType,
            profileImageId: p.profileImageId,
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
}
