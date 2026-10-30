CREATE TYPE "public"."event_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('wedding', 'xv', 'birthday', 'general');--> statement-breakpoint
CREATE TYPE "public"."guest_status" AS ENUM('enabled', 'disabled');--> statement-breakpoint
CREATE TYPE "public"."rsvp_response" AS ENUM('yes', 'no');--> statement-breakpoint
CREATE TYPE "public"."voice" AS ENUM('singular', 'plural');--> statement-breakpoint
CREATE TABLE "domains" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"event_id" uuid NOT NULL,
	"hostname" text NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path_prefix" text DEFAULT '' NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	CONSTRAINT "domains_hostname_unique" UNIQUE("hostname")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"adults_only" boolean DEFAULT false NOT NULL,
	"city_label" text,
	"client_name" text,
	"client_token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"hashtag" text,
	"hosts" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"published_at" timestamp with time zone,
	"rsvp_deadline" timestamp with time zone,
	"slug" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"status" "event_status" DEFAULT 'draft' NOT NULL,
	"template_key" text NOT NULL,
	"theme_overrides" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"timezone" text DEFAULT 'America/Mexico_City' NOT NULL,
	"title" text NOT NULL,
	"type" "event_type" NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"voice" "voice" NOT NULL,
	CONSTRAINT "events_client_token_unique" UNIQUE("client_token"),
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "guest_uploads" (
	"approved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"event_id" uuid NOT NULL,
	"guest_id" uuid,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guests" (
	"adults" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"display_name" text NOT NULL,
	"event_id" uuid NOT NULL,
	"group" text,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kids" integer,
	"max_passes" integer DEFAULT 1 NOT NULL,
	"notes" text,
	"personal_message" text,
	"phone" text,
	"slug" text NOT NULL,
	"status" "guest_status" DEFAULT 'enabled' NOT NULL,
	"table" text,
	"token" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "guests_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "media" (
	"alt" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"event_id" uuid NOT NULL,
	"height" integer,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"url" text NOT NULL,
	"width" integer
);
--> statement-breakpoint
CREATE TABLE "rsvp_history" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"guest_id" uuid NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip" text,
	"message" text,
	"passes" integer NOT NULL,
	"response" "rsvp_response" NOT NULL,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "rsvps" (
	"answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"guest_id" uuid NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message" text,
	"passes" integer NOT NULL,
	"responded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"response" "rsvp_response" NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rsvps_guest_id_unique" UNIQUE("guest_id")
);
--> statement-breakpoint
CREATE TABLE "sections" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"event_id" uuid NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"position" integer NOT NULL,
	"type" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"variant" text
);
--> statement-breakpoint
ALTER TABLE "domains" ADD CONSTRAINT "domains_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guest_uploads" ADD CONSTRAINT "guest_uploads_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guest_uploads" ADD CONSTRAINT "guest_uploads_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guests" ADD CONSTRAINT "guests_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rsvp_history" ADD CONSTRAINT "rsvp_history_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "guests_event_slug_idx" ON "guests" USING btree ("event_id","slug");