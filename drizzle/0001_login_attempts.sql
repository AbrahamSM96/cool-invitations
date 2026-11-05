CREATE TYPE "public"."login_outcome" AS ENUM('success', 'failure', 'bot');--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip" text NOT NULL,
	"outcome" "login_outcome" NOT NULL,
	"user_agent" text
);
--> statement-breakpoint
CREATE INDEX "login_attempts_ip_created_idx" ON "login_attempts" USING btree ("ip","created_at");--> statement-breakpoint
CREATE INDEX "login_attempts_created_idx" ON "login_attempts" USING btree ("created_at");