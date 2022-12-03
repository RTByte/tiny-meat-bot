-- CreateTable
CREATE TABLE "sticker" (
    "id" TEXT NOT NULL,
    "uses" INTEGER NOT NULL DEFAULT 0,
    "url" TEXT NOT NULL,

    CONSTRAINT "sticker_pkey" PRIMARY KEY ("id")
);
