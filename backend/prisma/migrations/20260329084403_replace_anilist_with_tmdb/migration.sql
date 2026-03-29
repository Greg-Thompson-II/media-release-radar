/*
  Warnings:

  - You are about to drop the column `aniListId` on the `Media` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tmdbId]` on the table `Media` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tmdbId` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Media_aniListId_key";

-- AlterTable
ALTER TABLE "Media" DROP COLUMN "aniListId",
ADD COLUMN     "tmdbId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Media_tmdbId_key" ON "Media"("tmdbId");
