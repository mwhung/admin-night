-- Add event-level reaction storage and session-level reaction aggregates.

CREATE TABLE "community_intents" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "community_intents_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "community_intents_createdAt_idx"
    ON "community_intents"("createdAt");

CREATE TABLE "community_reactions" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "windowType" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "community_reactions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "community_reactions_type_windowType_windowStart_key"
    ON "community_reactions"("type", "windowType", "windowStart");

CREATE INDEX "community_reactions_windowType_windowStart_idx"
    ON "community_reactions"("windowType", "windowStart");

CREATE TABLE "community_milestones" (
    "id" TEXT NOT NULL,
    "windowType" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "totalSteps" INTEGER NOT NULL DEFAULT 0,
    "totalFirstSteps" INTEGER NOT NULL DEFAULT 0,
    "activeUsers" INTEGER NOT NULL DEFAULT 0,
    "topCategories" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "community_milestones_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "community_milestones_windowType_windowStart_key"
    ON "community_milestones"("windowType", "windowStart");

CREATE TABLE "community_unlocks" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "assetUrl" TEXT,
    "threshold" INTEGER NOT NULL,
    "isUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "unlockedAt" TIMESTAMP(3),
    "windowType" TEXT NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "community_unlocks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "community_unlocks_windowType_windowStart_idx"
    ON "community_unlocks"("windowType", "windowStart");

CREATE TABLE "community_reaction_events" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "community_reaction_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "community_session_reactions" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "community_session_reactions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "community_session_reactions_sessionId_type_key"
    ON "community_session_reactions"("sessionId", "type");

CREATE INDEX "community_session_reactions_sessionId_idx"
    ON "community_session_reactions"("sessionId");

CREATE INDEX "community_reaction_events_createdAt_idx"
    ON "community_reaction_events"("createdAt");

CREATE INDEX "community_reaction_events_sessionId_createdAt_idx"
    ON "community_reaction_events"("sessionId", "createdAt");

CREATE INDEX "community_reaction_events_userId_createdAt_idx"
    ON "community_reaction_events"("userId", "createdAt");

ALTER TABLE "community_reaction_events"
    ADD CONSTRAINT "community_reaction_events_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "community_reaction_events"
    ADD CONSTRAINT "community_reaction_events_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "work_sessions"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "community_session_reactions"
    ADD CONSTRAINT "community_session_reactions_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "work_sessions"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
