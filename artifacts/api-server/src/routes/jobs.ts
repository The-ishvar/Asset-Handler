import { Router } from "express";
import { db } from "@workspace/db";
import { jobsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin, requireAuth } from "../middlewares/auth";

const router = Router();

function fmt(s: typeof jobsTable.$inferSelect) {
  return {
    id: s.id,
    title: s.title,
    description: s.description,
    location: s.location,
    salary: s.salary,
    contactPhone: s.contactNumber,
    contactNumber: s.contactNumber,
    company: null,
    type: null,
    createdAt: s.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const rows = await db.select().from(jobsTable).orderBy(jobsTable.createdAt);
  res.json(rows.map(fmt));
});

router.get("/:id", async (req, res) => {
  const [row] = await db.select().from(jobsTable).where(eq(jobsTable.id, parseInt(req.params.id as string))).limit(1);
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(fmt(row));
});

router.post("/", requireAuth, async (req, res) => {
  const { title, company, type, location, salary, contactPhone, contactNumber, description } = req.body;
  if (!title) { res.status(400).json({ error: "title required" }); return; }
  const [row] = await db.insert(jobsTable).values({
    userId: req.user!.userId,
    title,
    description: description || null,
    contactNumber: contactPhone || contactNumber || "",
    salary: salary || null,
    location: location || null,
  }).returning();
  res.status(201).json(fmt(row));
});

router.patch("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const [existing] = await db.select().from(jobsTable).where(eq(jobsTable.id, id)).limit(1);
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }
  if (existing.userId !== req.user!.userId && req.user!.role !== "admin" && req.user!.role !== "super_admin") {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  const { title, description, location, salary, contactPhone, contactNumber } = req.body;
  const updates: Partial<typeof jobsTable.$inferInsert> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (location !== undefined) updates.location = location;
  if (salary !== undefined) updates.salary = salary;
  if (contactPhone !== undefined || contactNumber !== undefined) updates.contactNumber = contactPhone ?? contactNumber;
  const [row] = await db.update(jobsTable).set(updates).where(eq(jobsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(fmt(row));
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const [existing] = await db.select().from(jobsTable).where(eq(jobsTable.id, id)).limit(1);
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }
  if (existing.userId !== req.user!.userId && req.user!.role !== "admin" && req.user!.role !== "super_admin") {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  await db.delete(jobsTable).where(eq(jobsTable.id, id));
  res.status(204).end();
});

export default router;
