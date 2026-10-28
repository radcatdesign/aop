import { boolean, index, pgTable, text, timestamp, uuid, integer, uniqueIndex } from "drizzle-orm/pg-core";

export const betaRequests = pgTable("beta_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  practice: text("practice").notNull(),
  role: text("role").notNull(),
  reason: text("reason").notNull(),
  status: text("status").$type<"pending" | "approved" | "rejected">().notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
}, (table) => [uniqueIndex("beta_requests_email_idx").on(table.email)]);

export const betaUsers = pgTable("beta_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  role: text("role").$type<"admin" | "tester">().notNull().default("tester"),
  status: text("status").$type<"pending" | "approved" | "rejected" | "suspended">().notNull().default("pending"),
  acknowledged: boolean("acknowledged").notNull().default(false),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("beta_users_email_idx").on(table.email)]);

export const betaFeedback = pgTable("beta_feedback", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => betaUsers.id),
  category: text("category").$type<"bug" | "idea" | "other">().notNull(),
  message: text("message").notNull(),
  rating: integer("rating"),
  platform: text("platform").$type<"web" | "mobile">().notNull(),
  screen: text("screen").$type<"overview" | "schedule" | "clients" | "notes" | "billing" | "settings" | "other">().notNull(),
  status: text("status").$type<"new" | "in_review" | "resolved">().notNull().default("new"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("beta_feedback_user_idx").on(table.userId)]);

export const betaEvents = pgTable("beta_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => betaUsers.id),
  event: text("event").$type<"session_start" | "screen_view" | "assessment_saved" | "checkout_demo">().notNull(),
  platform: text("platform").$type<"web" | "mobile">().notNull(),
  screen: text("screen").$type<"overview" | "schedule" | "clients" | "notes" | "billing" | "settings" | "other">().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("beta_events_created_idx").on(table.createdAt)]);

export const betaRateLimits = pgTable("beta_rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});