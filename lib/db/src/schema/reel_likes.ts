import { pgTable, serial, integer, timestamp, unique } from "drizzle-orm/pg-core";

export const reelLikesTable = pgTable("reel_likes", {
  id: serial("id").primaryKey(),
  reelId: integer("reel_id").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [unique().on(t.reelId, t.userId)]);

export type ReelLike = typeof reelLikesTable.$inferSelect;
