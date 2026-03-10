CREATE TYPE "public"."attachment_type" AS ENUM('sheet', 'audio');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('regular_rehearsal', 'exceptional_rehearsal', 'general_rehearsal', 'concert', 'meeting');--> statement-breakpoint
CREATE TYPE "public"."presence_status" AS ENUM('yes', 'maybe', 'no', 'unset');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'director', 'member');--> statement-breakpoint
CREATE TYPE "public"."voice_group" AS ENUM('S', 'A', 'T', 'B');--> statement-breakpoint
CREATE TABLE "attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"composition_id" uuid NOT NULL,
	"type" "attachment_type" NOT NULL,
	"name" varchar(255) NOT NULL,
	"url" varchar(1000) NOT NULL,
	"is_link" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "compositions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ensemble_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"author" varchar(255) NOT NULL,
	"duration" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_compositions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"composition_id" uuid NOT NULL,
	CONSTRAINT "event_compositions_event_composition_unique" UNIQUE("event_id","composition_id")
);
--> statement-breakpoint
CREATE TABLE "ensembles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"status" "presence_status" DEFAULT 'unset' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "event_attendance_event_member_unique" UNIQUE("event_id","member_id")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ensemble_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "event_type" NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"time" varchar(10) NOT NULL,
	"place" varchar(255) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"role" "user_role" NOT NULL,
	CONSTRAINT "member_roles_member_role_unique" UNIQUE("member_id","role")
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ensemble_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"profile_picture" varchar(500),
	"voice_group" "voice_group",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "members_ensemble_user_unique" UNIQUE("ensemble_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_composition_id_compositions_id_fk" FOREIGN KEY ("composition_id") REFERENCES "public"."compositions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compositions" ADD CONSTRAINT "compositions_ensemble_id_ensembles_id_fk" FOREIGN KEY ("ensemble_id") REFERENCES "public"."ensembles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_compositions" ADD CONSTRAINT "event_compositions_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_compositions" ADD CONSTRAINT "event_compositions_composition_id_compositions_id_fk" FOREIGN KEY ("composition_id") REFERENCES "public"."compositions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_attendance" ADD CONSTRAINT "event_attendance_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_attendance" ADD CONSTRAINT "event_attendance_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_ensemble_id_ensembles_id_fk" FOREIGN KEY ("ensemble_id") REFERENCES "public"."ensembles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_roles" ADD CONSTRAINT "member_roles_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_ensemble_id_ensembles_id_fk" FOREIGN KEY ("ensemble_id") REFERENCES "public"."ensembles"("id") ON DELETE no action ON UPDATE no action;