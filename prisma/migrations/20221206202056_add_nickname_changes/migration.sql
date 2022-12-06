-- AlterTable
ALTER TABLE "guild" ADD COLUMN     "nicknameChanges" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "member" ADD COLUMN     "nicknameChanges" INTEGER NOT NULL DEFAULT 0;
