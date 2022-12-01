/*
  Warnings:

  - The primary key for the `client` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `client_id` on the `client` table. All the data in the column will be lost.
  - Added the required column `id` to the `client` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "client" DROP CONSTRAINT "client_pkey",
DROP COLUMN "client_id",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "client_pkey" PRIMARY KEY ("id");
