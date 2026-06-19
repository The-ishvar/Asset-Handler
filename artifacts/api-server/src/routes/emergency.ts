import { Router } from "express";
import { db } from "@workspace/db";
import { emergencyContactsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

function fmt(s: typeof emergencyContactsTable.$inferSelect) {
  return {
    id: s.id,
    name: s.name,
    phone: s.contactNumber,
    contactNumber: s.contactNumber,
    description: s.description,
    category: s.category,
    createdAt: s.createdAt.toISOString(),
  };
}

const VALID_CATEGORIES = ["hospital", "ambulance", "police", "electricity", "fire", "other"] as const;
type Category = typeof VALID_CATEGORIES[number];

function resolveCategory(cat?: string): Category {
  if (cat && VALID_CATEGORIES.includes(cat as Category)) return cat as Category;
  return "other";
}

router.get("/", async (req, res) => {
  const rows = await db.select().from(emergencyContactsTable).orderBy(emergencyContactsTable.category);
  res.json(rows.map(fmt));
});

router.post("/", requireAdmin, async (req, res) => {
  const { name, phone, contactNumber, category, description } = req.body;
  if (!name) { res.status(400).json({ error: "name required" }); return; }
  const [row] = await db.insert(emergencyContactsTable).values({
    name,
    contactNumber: phone || contactNumber || "",
    category: resolveCategory(category),
    description: description || null,
  }).returning();
  res.status(201).json(fmt(row));
});

router.patch("/:id", requireAdmin, async (req, res) => {
  const { name, phone, contactNumber, category, description } = req.body;
  const updates: Partial<typeof emergencyContactsTable.$inferInsert> = {};
  if (name !== undefined) updates.name = name;
  if (phone !== undefined || contactNumber !== undefined) updates.contactNumber = phone ?? contactNumber;
  if (category !== undefined) updates.category = resolveCategory(category);
  if (description !== undefined) updates.description = description;
  const [row] = await db.update(emergencyContactsTable).set(updates).where(eq(emergencyContactsTable.id, parseInt(req.params.id as string))).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(fmt(row));
});

router.delete("/:id", requireAdmin, async (req, res) => {
  await db.delete(emergencyContactsTable).where(eq(emergencyContactsTable.id, parseInt(req.params.id as string)));
  res.status(204).end();
});

export default router;
