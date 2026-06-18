import { Router } from "express";
import { db } from "@workspace/db";
import { shopsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

function fmt(s: typeof shopsTable.$inferSelect) {
  return { ...s, createdAt: s.createdAt.toISOString() };
}

router.get("/", async (req, res) => {
  const rows = await db.select().from(shopsTable).orderBy(shopsTable.name);
  res.json(rows.map(fmt));
});

router.post("/", requireAdmin, async (req, res) => {
  const { name, photoUrl, availableItems, price, contactNumber, location, mapLocation } = req.body;
  if (!name || !contactNumber || !location) {
    res.status(400).json({ error: "name, contactNumber, location required" });
    return;
  }
  const [row] = await db.insert(shopsTable).values({ name, photoUrl, availableItems, price, contactNumber, location, mapLocation }).returning();
  res.status(201).json(fmt(row));
});

router.get("/:id", async (req, res) => {
  const [row] = await db.select().from(shopsTable).where(eq(shopsTable.id, parseInt(req.params.id as string))).limit(1);
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(fmt(row));
});

router.patch("/:id", requireAdmin, async (req, res) => {
  const updates: Partial<typeof shopsTable.$inferInsert> = {};
  const fields = ["name", "photoUrl", "availableItems", "price", "contactNumber", "location", "mapLocation"] as const;
  for (const f of fields) if (req.body[f] !== undefined) (updates as any)[f] = req.body[f];
  const [row] = await db.update(shopsTable).set(updates).where(eq(shopsTable.id, parseInt(req.params.id as string))).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(fmt(row));
});

router.delete("/:id", requireAdmin, async (req, res) => {
  await db.delete(shopsTable).where(eq(shopsTable.id, parseInt(req.params.id as string)));
  res.status(204).end();
});

export default router;
