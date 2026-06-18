import { Router } from "express";
import { db } from "@workspace/db";
import { jobsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

function fmt(s: typeof jobsTable.$inferSelect) {
  return { ...s, createdAt: s.createdAt.toISOString() };
}

router.get("/", async (req, res) => {
  const rows = await db.select().from(jobsTable).orderBy(jobsTable.createdAt);
  res.json(rows.map(fmt));
});

router.post("/", requireAdmin, async (req, res) => {
  const { title, description, contactNumber, salary, location } = req.body;
  if (!title || !contactNumber) {
    res.status(400).json({ error: "title, contactNumber required" }); return;
  }
  const [row] = await db.insert(jobsTable).values({ title, description, contactNumber, salary, location }).returning();
  res.status(201).json(fmt(row));
});

router.patch("/:id", requireAdmin, async (req, res) => {
  const updates: Partial<typeof jobsTable.$inferInsert> = {};
  const fields = ["title", "description", "contactNumber", "salary", "location"] as const;
  for (const f of fields) if (req.body[f] !== undefined) (updates as any)[f] = req.body[f];
  const [row] = await db.update(jobsTable).set(updates).where(eq(jobsTable.id, parseInt(req.params.id as string))).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(fmt(row));
});

router.delete("/:id", requireAdmin, async (req, res) => {
  await db.delete(jobsTable).where(eq(jobsTable.id, parseInt(req.params.id as string)));
  res.status(204).end();
});

export default router;
