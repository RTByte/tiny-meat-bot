/*
  Warnings:

  - Added the required column `restarts` to the `client` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "client" ADD COLUMN     "restarts" INTEGER NOT NULL;
