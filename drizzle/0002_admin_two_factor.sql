CREATE TABLE "admin_backup_codes" (
	"code_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"used_at" timestamp with time zone,
	CONSTRAINT "admin_backup_codes_code_hash_unique" UNIQUE("code_hash")
);
--> statement-breakpoint
ALTER TABLE "login_attempts" ADD COLUMN "totp_step" integer;