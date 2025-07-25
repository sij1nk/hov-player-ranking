import { fetchPlayersFromLeaderboard } from "./fetch.ts";
import { getPlayerList, playerComparator } from "./player.ts";
import { PrismaClient } from "./generated/prisma/index.js";

const pvpScoreLeaderboardId = "16808192";
const totalScoreLeaderboardId = "16656646";

const totalScoreLeaderboardPlayers = await fetchPlayersFromLeaderboard(
  totalScoreLeaderboardId
);
const pvpScoreLeaderboardPlayers = await fetchPlayersFromLeaderboard(
  pvpScoreLeaderboardId
);

const players = getPlayerList(
  totalScoreLeaderboardPlayers,
  pvpScoreLeaderboardPlayers
);
players.sort(playerComparator);

const date = new Date();

console.log(JSON.stringify(players));

const prisma = new PrismaClient();

await prisma.$transaction(async (tx) => {
  const newSnapshot = await tx.leaderboardSnapshot.create({
    data: {
      date,
    },
  });

  const upsertPlayerPromises = players.map((p) => {
    const newStats = {
      snapshotId: newSnapshot.id,
      totalRank: p.totalRank,
      totalScore: p.totalScore,
      pvpRank: p.pvpRank,
      pvpScore: p.pvpScore,
      scoreRatioMin:
        p.scoreRatio._type === "known" ? p.scoreRatio.value : p.scoreRatio.min,
      scoreRatioMax:
        p.scoreRatio._type === "known" ? p.scoreRatio.value : p.scoreRatio.max,
    };

    tx.player.upsert({
      where: {
        steamId: p.steamId,
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
