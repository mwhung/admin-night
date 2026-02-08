-- Persist actual focused duration for session summaries and analytics.
ALTER TABLE "work_session_participants"
    ADD COLUMN "focusDurationSeconds" INTEGER;
