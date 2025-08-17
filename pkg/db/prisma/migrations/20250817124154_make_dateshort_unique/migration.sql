/*
  Warnings:

  - A unique constraint covering the columns `[dateShort]` on the table `leaderboard_snapshots` will be added. If there are existing duplicate values, this will fail.
  - Made the column `dateShort` on table `leaderboard_snapshots` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."leaderboard_snapshots" ALTER COLUMN "dateShort" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "leaderboard_snapshots_dateShort_key" ON "public"."leaderboard_snapshots"("dateShort");
