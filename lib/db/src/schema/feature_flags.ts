import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const featureFlagsTable = pgTable("feature_flags", {
  key: text("key").primaryKey(),
  enabled: boolean("enabled").notNull().default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type FeatureFlag = typeof featureFlagsTable.$inferSelect;
