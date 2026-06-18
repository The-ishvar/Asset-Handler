import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const busesTable = pgTable("buses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  route: text("route").notNull(),
  departureTime: text("departure_time").notNull(),
  arrivalTime: text("arrival_time"),
  fare: text("fare").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBusSchema = createInsertSchema(busesTable).omit({ id: true, createdAt: true });
export type InsertBus = z.infer<typeof insertBusSchema>;
export type Bus = typeof busesTable.$inferSelect;
