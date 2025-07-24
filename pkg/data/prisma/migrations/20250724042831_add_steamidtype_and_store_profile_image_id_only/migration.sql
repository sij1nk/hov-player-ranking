/*
  Warnings:

  - You are about to drop the column `profileImageLink` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `profileLink` on the `players` table. All the data in the column will be lost.
  - You are about to drop the column `steamid` on the `players` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[steamId]` on the table `players` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `profileImageId` to the `players` table without a default value. This is not possible if the table is not empty.
  - Added the required column `steamId` to the `players` table without a default value. This is not possible if the table is not empty.
  - Added the required column `steamIdType` to the `players` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SteamIdType" AS ENUM ('ID', 'CUSTOM');

-- DropIndex
DROP INDEX "players_steamid_key";

-- AlterTable
ALTER TABLE "players" DROP COLUMN "profileImageLink",
DROP COLUMN "profileLink",
DROP COLUMN "steamid",
ADD COLUMN     "profileImageId" TEXT NOT NULL,
ADD COLUMN     "steamId" TEXT NOT NULL,
ADD COLUMN     "steamIdType" "SteamIdType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "players_steamId_key" ON "players"("steamId");
