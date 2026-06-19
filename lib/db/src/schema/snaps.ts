import { pgTable, serial, integer, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const snapsTable = pgTable("snaps", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  mediaUrl: text("media_url"),
  caption: text("caption"),
  viewed: boolean("viewed").default(false).notNull(),
  viewedAt: timestamp("viewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Snap = typeof snapsTable.$inferSelect;
