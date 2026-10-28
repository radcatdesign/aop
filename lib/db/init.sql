CREATE TABLE "beta_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"event" text NOT NULL,
	"platform" text NOT NULL,
	"screen" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "beta_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category" text NOT NULL,
	"message" text NOT NULL,
	"rating" integer,
	"platform" text NOT NULL,
	"screen" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"admin_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "beta_rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);

CREATE TABLE "beta_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"practice" text NOT NULL,
	"license_number" text DEFAULT '' NOT NULL,
	"role" text NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewed_at" timestamp with time zone
);

CREATE TABLE "beta_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT 'tester' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"acknowledged" boolean DEFAULT false NOT NULL,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "beta_users_clerk_id_unique" UNIQUE("clerk_id")
);

ALTER TABLE "beta_events" ADD CONSTRAINT "beta_events_user_id_beta_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."beta_users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "beta_feedback" ADD CONSTRAINT "beta_feedback_user_id_beta_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."beta_users"("id") ON DELETE no action ON UPDATE no action;
CREATE INDEX "beta_events_created_idx" ON "beta_events" USING btree ("created_at");
CREATE INDEX "beta_feedback_user_idx" ON "beta_feedback" USING btree ("user_id");
CREATE UNIQUE INDEX "beta_requests_email_idx" ON "beta_requests" USING btree ("email");
CREATE INDEX "beta_users_email_idx" ON "beta_users" USING btree ("email");
