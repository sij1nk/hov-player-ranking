-- CreateTable
CREATE TABLE "players" (
    "id" SERIAL NOT NULL,
    "steamid" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "profileLink" TEXT NOT NULL,
    "profileImageLink" TEXT NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_stats" (
    "id" SERIAL NOT NULL,
    "totalRank" INTEGER,
    "totalScore" INTEGER,
    "pvpRank" INTEGER,
    "pvpScore" INTEGER,
    "scoreRatioMin" INTEGER NOT NULL,
    "scoreRatioMax" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "snapshotId" INTEGER NOT NULL,

    CONSTRAINT "player_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaderboard_snapshots" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leaderboard_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "players_steamid_key" ON "players"("steamid");

-- AddForeignKey
ALTER TABLE "player_stats" ADD CONSTRAINT "player_stats_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_stats" ADD CONSTRAINT "player_stats_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "leaderboard_snapshots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
