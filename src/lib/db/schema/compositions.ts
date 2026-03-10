import { pgTable, uuid, varchar, timestamp, boolean, pgEnum, unique } from "drizzle-orm/pg-core";
import { ensembles } from "./ensembles";
import { events } from "./events";

export const compositions = pgTable("compositions", {
  id: uuid("id").defaultRandom().primaryKey(),
  ensembleId: uuid("ensemble_id")
    .notNull()
    .references(() => ensembles.id),
  name: varchar("name", { length: 255 }).notNull(),
  author: varchar("author", { length: 255 }).notNull(),
  duration: varchar("duration", { length: 50 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const eventCompositions = pgTable("event_compositions", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  compositionId: uuid("composition_id")
    .notNull()
    .references(() => compositions.id, { onDelete: "cascade" }),
}, (table) => [
  unique("event_compositions_event_composition_unique").on(table.eventId, table.compositionId),
]);

export const attachmentTypeEnum = pgEnum("attachment_type", ["sheet", "audio"]);

export const attachments = pgTable("attachments", {
  id: uuid("id").defaultRandom().primaryKey(),
  compositionId: uuid("composition_id")
    .notNull()
    .references(() => compositions.id, { onDelete: "cascade" }),
  type: attachmentTypeEnum("type").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  url: varchar("url", { length: 1000 }).notNull(),
  isLink: boolean("is_link").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
