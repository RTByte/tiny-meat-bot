-- AlterTable
ALTER TABLE "channel" ADD COLUMN     "linksSent" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "guild" ADD COLUMN     "linksSent" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "member" ADD COLUMN     "linksSent" INTEGER NOT NULL DEFAULT 0;
