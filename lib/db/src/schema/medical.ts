import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const medicalStoresTable = pgTable("medical_stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  availableMedicines: text("available_medicines"),
  contactNumber: text("contact_number").notNull(),
  location: text("location").notNull(),
  mapLocation: text("map_location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMedicalStoreSchema = createInsertSchema(medicalStoresTable).omit({ id: true, createdAt: true });
export type InsertMedicalStore = z.infer<typeof insertMedicalStoreSchema>;
export type MedicalStore = typeof medicalStoresTable.$inferSelect;
