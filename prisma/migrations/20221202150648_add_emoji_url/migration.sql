/*
  Warnings:

  - Added the required column `url` to the `emoji` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "emoji" ADD COLUMN     "url" TEXT NOT NULL;
