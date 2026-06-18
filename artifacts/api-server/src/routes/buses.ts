import { Router } from "express";
import { db } from "@workspace/db";
import { busesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

function fmt(s: typeof busesTable.$inferSelect) {
  return { ...s, createdAt: s.createdAt.toISOString() };
}

router.get("/", async (req, res) => {
  const rows = await db.select().from(busesTable).orderBy(busesTable.departureTime);
  res.json(rows.map(fmt));
});

router.post("/", requireAdmin, async (req, res) => {
  const { name, route, departureTime, arrivalTime, fare } = req.body;
  if (!name || !route || !departureTime || !fare) {
    res.status(400).json({ error: "name, route, departureTime, fare required" }); return;
  }
  const [row] = await db.insert(busesTable).values({ name, route, departureTime, arrivalTime, fare }).returning();
  res.status(201).json(fmt(row));
});

router.patch("/:id", requireAdmin, async (req, res) => {
  const updates: Partial<typeof busesTable.$inferInsert> = {};
  const fields = ["name", "route", "departureTime", "arrivalTime", "fare"] as const;
  for (const f of fields) if (req.body[f] !== undefined) (updates as any)[f] = req.body[f];
  const [row] = await db.update(busesTable).set(updates).where(eq(busesTable.id, parseInt(req.params.id as string))).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(fmt(row));
});

router.delete("/:id", requireAdmin, async (req, res) => {
  await db.delete(busesTable).where(eq(busesTable.id, parseInt(req.params.id as string)));
  res.status(204).end();
});

export default router;
