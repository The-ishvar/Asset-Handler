import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const storiesTable = pgTable("stories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  userName: text("user_name"),
  userAvatarUrl: text("user_avatar_url"),
  mediaUrl: text("media_url").notNull(),
  mediaType: text("media_type").notNull().default("image"),
  caption: text("caption"),
  title: text("title"),
  musicUrl: text("music_url"),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const storyViewsTable = pgTable("story_views", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").notNull(),
  viewerId: integer("viewer_id").notNull(),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
});

export const insertStorySchema = createInsertSchema(storiesTable).omit({ id: true, createdAt: true, viewCount: true });
export type InsertStory = z.infer<typeof insertStorySchema>;
export type Story = typeof storiesTable.$inferSelect;
