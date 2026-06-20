import { pgTable, serial, integer, text, numeric, timestamp } from "drizzle-orm/pg-core";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  listingId: integer("listing_id").notNull(),
  sellerId: integer("seller_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  deliveryAddress: text("delivery_address"),
  paymentMethod: text("payment_method").notNull().default("cod"),
  status: text("status").notNull().default("pending"),
  buyerName: text("buyer_name"),
  buyerPhone: text("buyer_phone"),
  listingTitle: text("listing_title"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Order = typeof ordersTable.$inferSelect;
