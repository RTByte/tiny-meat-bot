-- CreateTable
CREATE TABLE "channel" (
    "id" TEXT NOT NULL,
    "messages" INTEGER NOT NULL DEFAULT 0,
    "messagesDeleted" INTEGER NOT NULL DEFAULT 0,
    "messagesUpdated" INTEGER NOT NULL DEFAULT 0,
    "reactionsAdded" INTEGER NOT NULL DEFAULT 0,
    "reactionsRemoved" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member" (
    "id" TEXT NOT NULL,
    "messages" INTEGER NOT NULL DEFAULT 0,
    "messagesDeleted" INTEGER NOT NULL DEFAULT 0,
    "messagesUpdated" INTEGER NOT NULL DEFAULT 0,
    "reactionsAdded" INTEGER NOT NULL DEFAULT 0,
    "reactionsRemoved" INTEGER NOT NULL DEFAULT 0,
    "scheduledEventsSubscribed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emoji" (
    "id" TEXT NOT NULL,
    "inMessages" INTEGER NOT NULL DEFAULT 0,
    "inReactions" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "emoji_pkey" PRIMARY KEY ("id")
);
