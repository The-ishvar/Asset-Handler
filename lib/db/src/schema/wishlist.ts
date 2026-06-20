import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";

export const wishlistTable = pgTable("wishlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  listingId: integer("listing_id").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export type WishlistItem = typeof wishlistTable.$inferSelect;
