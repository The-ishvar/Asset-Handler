import { Router } from "express";
import { db } from "@workspace/db";
import { eventsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

function fmt(s: typeof eventsTable.$inferSelect) {
  return { ...s, createdAt: s.createdAt.toISOString() };
}

router.get("/", async (req, res) => {
  const rows = await db.select().from(eventsTable).orderBy(eventsTable.date);
  res.json(rows.map(fmt));
});

router.post("/", requireAdmin, async (req, res) => {
  const { title, description, date, time, location } = req.body;
  if (!title || !date) {
    res.status(400).json({ error: "title, date required" }); return;
  }
  const [row] = await db.insert(eventsTable).values({ title, description, date, time, location }).returning();
  res.status(201).json(fmt(row));
});

router.patch("/:id", requireAdmin, async (req, res) => {
  const updates: Partial<typeof eventsTable.$inferInsert> = {};
  const fields = ["title", "description", "date", "time", "location"] as const;
  for (const f of fields) if (req.body[f] !== undefined) (updates as any)[f] = req.body[f];
  const [row] = await db.update(eventsTable).set(updates).where(eq(eventsTable.id, parseInt(req.params.id as string))).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(fmt(row));
});

router.delete("/:id", requireAdmin, async (req, res) => {
  await db.delete(eventsTable).where(eq(eventsTable.id, parseInt(req.params.id as string)));
  res.status(204).end();
});

export default router;
