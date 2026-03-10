import { pgTable, uuid, varchar, timestamp, text, pgEnum } from "drizzle-orm/pg-core";
import { ensembles } from "./ensembles";
import { members } from "./members";

export const eventTypeEnum = pgEnum("event_type", [
  "regular_rehearsal",
  "exceptional_rehearsal",
  "general_rehearsal",
  "concert",
  "meeting",
]);

export const presenceStatusEnum = pgEnum("presence_status", [
  "yes",
  "maybe",
  "no",
  "unset",
]);

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  ensembleId: uuid("ensemble_id")
    .notNull()
    .references(() => ensembles.id),
  name: varchar("name", { length: 255 }).notNull(),
  type: eventTypeEnum("type").notNull(),
  date: timestamp("date", { withTimezone: true }).notNull(),
  time: varchar("time", { length: 10 }).notNull(),
  place: varchar("place", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const eventAttendance = pgTable("event_attendance", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id),
  status: presenceStatusEnum("status").notNull().default("unset"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
