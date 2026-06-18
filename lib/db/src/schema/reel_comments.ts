import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reelCommentsTable = pgTable("reel_comments", {
  id: serial("id").primaryKey(),
  reelId: integer("reel_id").notNull(),
  userId: integer("user_id").notNull(),
  userName: text("user_name"),
  userAvatarUrl: text("user_avatar_url"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReelCommentSchema = createInsertSchema(reelCommentsTable).omit({ id: true, createdAt: true });
export type InsertReelComment = z.infer<typeof insertReelCommentSchema>;
export type ReelComment = typeof reelCommentsTable.$inferSelect;
