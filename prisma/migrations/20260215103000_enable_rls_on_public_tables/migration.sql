-- Harden Supabase Data API exposure by enabling RLS on all public tables.
-- We intentionally do not add anon/authenticated policies here.
-- App data access is handled through trusted server-side Prisma queries.

ALTER TABLE "public"."_prisma_migrations" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."user_achievements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."verification_tokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."work_session_participants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."work_sessions" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."community_intents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."community_reactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."community_milestones" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."community_unlocks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."community_reaction_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."community_session_reactions" ENABLE ROW LEVEL SECURITY;
