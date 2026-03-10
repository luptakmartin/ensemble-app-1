import { pgTable, uuid, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { ensembles } from "./ensembles";

export const voiceGroupEnum = pgEnum("voice_group", ["S", "A", "T", "B"]);
export const userRoleEnum = pgEnum("user_role", ["admin", "director", "member"]);

export const members = pgTable("members", {
  id: uuid("id").defaultRandom().primaryKey(),
  ensembleId: uuid("ensemble_id")
    .notNull()
    .references(() => ensembles.id),
  userId: uuid("user_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  profilePicture: varchar("profile_picture", { length: 500 }),
  voiceGroup: voiceGroupEnum("voice_group"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const memberRoles = pgTable("member_roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id),
  role: userRoleEnum("role").notNull(),
});
