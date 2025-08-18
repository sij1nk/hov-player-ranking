import { getDateShort, isSamePlayer } from "common";
import { PrismaClient } from "../generated/prisma/client.ts";
import { type Leaderboard } from "../types.ts";
import type { LeaderboardWriter } from "./index.ts";

export class DbLeaderboardWriter implements LeaderboardWriter {
  public async write(leaderboard: Leaderboard): Promise<void> {
    const prisma = new PrismaClient();

    const txOptions = {
      timeout: 60000,
    };

    await prisma.$transaction(async (tx) => {
      console.log(
        `Creating new leaderboard snapshot for ${leaderboard.date}...`
      );
      const newLeaderboardSnapshot = await tx.leaderboardSnapshot.create({
        data: {
          date: leaderboard.date,
          dateShort: getDateShort(new Date(leaderboard.date)),
        },
      });

      const dbPlayers = await tx.player.findMany();

      const missingPlayers = leaderboard.players.filter(
        (p) => !dbPlayers.some((dbp) => isSamePlayer(dbp, p))
      );

      console.log(
        `Adding player information for ${missingPlayers.length} new players...`
      );
      const addedDbPlayers = await tx.player.createManyAndReturn({
        data: missingPlayers.map((p) => ({
          name: p.name,
          steamId: p.steamId,
          steamIdType: p.steamIdType,
        })),
      });

      const allDbPlayers = [...dbPlayers, ...addedDbPlayers];

      const updatePlayerPromises = leaderboard.players
        .map((p) => {
          const dbp = allDbPlayers.find((_dbp) => isSamePlayer(_dbp, p))!;
          if (dbp.name === p.name && dbp.profileImageId === p.profileImageId)
            return null;
          return tx.player.update({
            where: {
              steamId: p.steamId,
              steamIdType: p.steamIdType,
            },
            data: {
              name: p.name,
              profileImageId: p.profileImageId,
            },
          });
        })
        .filter(Boolean);

      console.log(
        `Updating player information for ${updatePlayerPromises.length} players...`
      );
      await Promise.all(updatePlayerPromises);

      const newStats = leaderboard.players.map((p) => ({
        snapshotId: newLeaderboardSnapshot.id,
        playerId: allDbPlayers.find((dbp) => isSamePlayer(dbp, p))!.id,
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
      }));

      console.log(`Updating stats of ${newStats.length} players...`);
      await tx.playerStats.createMany({ data: newStats });
    }, txOptions);
  }
}
