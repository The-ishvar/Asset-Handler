import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";

export const listingReviewsTable = pgTable("listing_reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  listingId: integer("listing_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  userName: text("user_name"),
  userAvatar: text("user_avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ListingReview = typeof listingReviewsTable.$inferSelect;
