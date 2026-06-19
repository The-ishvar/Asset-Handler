import { pgTable, serial, integer, text, timestamp, numeric, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bookingTypeEnum = pgEnum("booking_type", ["auto", "bus", "event", "medical"]);
export const bookingStatusEnum = pgEnum("booking_status", ["pending", "accepted", "confirmed", "completed", "cancelled", "rejected"]);
export const paymentStatusEnum = pgEnum("payment_status", ["unpaid", "paid", "refunded"]);

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  providerId: integer("provider_id"),
  bookingType: bookingTypeEnum("booking_type").notNull(),
  status: bookingStatusEnum("status").notNull().default("pending"),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("unpaid"),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull().default("0"),
  details: jsonb("details"),
  qrCode: text("qr_code"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bookingStatusHistoryTable = pgTable("booking_status_history", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull(),
  fromStatus: text("from_status"),
  toStatus: text("to_status").notNull(),
  changedBy: integer("changed_by"),
  changedAt: timestamp("changed_at").defaultNow().notNull(),
  note: text("note"),
});

export const providersTable = pgTable("providers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  type: bookingTypeEnum("type").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  phone: text("phone"),
  location: text("location"),
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({ id: true, createdAt: true, updatedAt: true, qrCode: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
export type Provider = typeof providersTable.$inferSelect;
