/*
  Warnings:

  - You are about to drop the column `reactionsRemoved` on the `channel` table. All the data in the column will be lost.
  - You are about to drop the column `reactionsRemoved` on the `member` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "channel" DROP COLUMN "reactionsRemoved";

-- AlterTable
ALTER TABLE "member" DROP COLUMN "reactionsRemoved",
ADD COLUMN     "scheduledEventsUnsubscribed" INTEGER NOT NULL DEFAULT 0;
