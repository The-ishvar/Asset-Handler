import { pgTable, serial, text, timestamp, numeric, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const listingStatusEnum = pgEnum("listing_status", ["pending", "approved", "rejected"]);

export const listingsTable = pgTable("listings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  photoUrl: text("photo_url"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  contactInfo: text("contact_info").notNull(),
  status: listingStatusEnum("status").notNull().default("pending"),
  userId: integer("user_id"),
  userName: text("user_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertListingSchema = createInsertSchema(listingsTable).omit({ id: true, createdAt: true, status: true });
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listingsTable.$inferSelect;
