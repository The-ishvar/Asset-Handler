import { Router } from "express";
import { db } from "@workspace/db";
import { noticesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

function fmt(s: typeof noticesTable.$inferSelect) {
  return { ...s, createdAt: s.createdAt.toISOString() };
}

router.get("/", async (req, res) => {
  const rows = await db.select().from(noticesTable).orderBy(noticesTable.createdAt);
  res.json(rows.map(fmt));
});

router.post("/", requireAdmin, async (req, res) => {
  const { title, content, priority } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: "title, content required" }); return;
  }
  const [row] = await db.insert(noticesTable).values({ title, content, priority: priority ?? "medium" }).returning();
  res.status(201).json(fmt(row));
});

router.patch("/:id", requireAdmin, async (req, res) => {
  const updates: Partial<typeof noticesTable.$inferInsert> = {};
  const { title, content, priority } = req.body;
  if (title !== undefined) updates.title = title;
  if (content !== undefined) updates.content = content;
  if (priority !== undefined) updates.priority = priority;
  const [row] = await db.update(noticesTable).set(updates).where(eq(noticesTable.id, parseInt(req.params.id as string))).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(fmt(row));
});

router.delete("/:id", requireAdmin, async (req, res) => {
  await db.delete(noticesTable).where(eq(noticesTable.id, parseInt(req.params.id as string)));
  res.status(204).end();
});

export default router;
