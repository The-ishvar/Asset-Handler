import { Router } from "express";
import { db } from "@workspace/db";
import { emergencyContactsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

function fmt(s: typeof emergencyContactsTable.$inferSelect) {
  return { ...s, createdAt: s.createdAt.toISOString() };
}

router.get("/", async (req, res) => {
  const rows = await db.select().from(emergencyContactsTable).orderBy(emergencyContactsTable.category);
  res.json(rows.map(fmt));
});

router.post("/", requireAdmin, async (req, res) => {
  const { name, contactNumber, category, description } = req.body;
  if (!name || !contactNumber || !category) {
    res.status(400).json({ error: "name, contactNumber, category required" }); return;
  }
  const [row] = await db.insert(emergencyContactsTable).values({ name, contactNumber, category, description }).returning();
  res.status(201).json(fmt(row));
});

router.patch("/:id", requireAdmin, async (req, res) => {
  const updates: Partial<typeof emergencyContactsTable.$inferInsert> = {};
  const { name, contactNumber, category, description } = req.body;
  if (name !== undefined) updates.name = name;
  if (contactNumber !== undefined) updates.contactNumber = contactNumber;
  if (category !== undefined) updates.category = category;
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
