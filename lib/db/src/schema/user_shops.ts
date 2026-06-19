import { pgTable, serial, integer, text, numeric, timestamp } from "drizzle-orm/pg-core";

export const userShopsTable = pgTable("user_shops", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userShopItemsTable = pgTable("user_shop_items", {
  id: serial("id").primaryKey(),
  shopId: integer("shop_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  photos: text("photos"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type UserShop = typeof userShopsTable.$inferSelect;
export type UserShopItem = typeof userShopItemsTable.$inferSelect;
