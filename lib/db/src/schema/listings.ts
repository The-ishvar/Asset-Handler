import { pgTable, serial, text, timestamp, numeric, integer, pgEnum, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const listingStatusEnum = pgEnum("listing_status", ["pending", "approved", "rejected"]);

export const MARKETPLACE_CATEGORIES = [
  "All", "Fashion", "Electronics", "Grocery", "Medical",
  "Home & Kitchen", "Farming", "Vehicles", "Services", "Others",
] as const;

export const listingsTable = pgTable("listings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  photoUrl: text("photo_url"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  discountPrice: numeric("discount_price", { precision: 10, scale: 2 }),
  contactInfo: text("contact_info").notNull(),
  status: listingStatusEnum("status").notNull().default("pending"),
  category: text("category").notNull().default("Others"),
  location: text("location"),
  quantity: integer("quantity").notNull().default(1),
  deliveryAvailable: boolean("delivery_available").notNull().default(false),
  isSoldOut: boolean("is_sold_out").notNull().default(false),
  userId: integer("user_id"),
  userName: text("user_name"),
  userAvatar: text("user_avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertListingSchema = createInsertSchema(listingsTable).omit({ id: true, createdAt: true, status: true });
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listingsTable.$inferSelect;
