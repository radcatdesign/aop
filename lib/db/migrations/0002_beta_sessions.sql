-- Session log: one row per opened sample workspace; feedback links to the open session.
DO $$ BEGIN
CREATE TABLE IF NOT EXISTS "beta_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"platform" text NOT NULL,
	"mode" text DEFAULT 'demo' NOT NULL,
	"walkthrough" boolean DEFAULT false NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"end_reason" text
);
ALTER TABLE "beta_sessions" ADD CONSTRAINT "beta_sessions_user_id_beta_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."beta_users"("id") ON DELETE no action ON UPDATE no action;
CREATE INDEX IF NOT EXISTS "beta_sessions_user_idx" ON "beta_sessions" USING btree ("user_id","started_at");
ALTER TABLE "beta_feedback" ADD COLUMN IF NOT EXISTS "session_id" uuid;
ALTER TABLE "beta_feedback" ADD CONSTRAINT "beta_feedback_session_id_beta_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."beta_sessions"("id") ON DELETE no action ON UPDATE no action;
CREATE INDEX IF NOT EXISTS "beta_feedback_session_idx" ON "beta_feedback" USING btree ("session_id");
END $$;
-- Where feedback was given: page (auto), area (tester-chosen), area_detail (optional spot).
ALTER TABLE "beta_feedback" ADD COLUMN IF NOT EXISTS "page" text;
ALTER TABLE "beta_feedback" ADD COLUMN IF NOT EXISTS "area" text;
ALTER TABLE "beta_feedback" ADD COLUMN IF NOT EXISTS "area_detail" text;
