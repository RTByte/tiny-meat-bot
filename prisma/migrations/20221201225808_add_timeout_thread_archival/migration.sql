-- AlterTable
ALTER TABLE "guild" ADD COLUMN     "membersTimedOut" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "threadsClosed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "threadsReopened" INTEGER NOT NULL DEFAULT 0;
