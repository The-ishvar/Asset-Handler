import { Router } from "express";
import { db } from "@workspace/db";
import { jobsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

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

router.post("/", requireAdmin, async (req, res) => {
  const { title, company, type, location, salary, contactPhone, contactNumber, description } = req.body;
  if (!title) { res.status(400).json({ error: "title required" }); return; }
  const [row] = await db.insert(jobsTable).values({
    title,
    description: description || null,
    contactNumber: contactPhone || contactNumber || "",
    salary: salary || null,
    location: location || null,
  }).returning();
  res.status(201).json(fmt(row));
});

router.patch("/:id", requireAdmin, async (req, res) => {
  const { title, description, location, salary, contactPhone, contactNumber } = req.body;
  const updates: Partial<typeof jobsTable.$inferInsert> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (location !== undefined) updates.location = location;
  if (salary !== undefined) updates.salary = salary;
  if (contactPhone !== undefined || contactNumber !== undefined) updates.contactNumber = contactPhone ?? contactNumber;
  const [row] = await db.update(jobsTable).set(updates).where(eq(jobsTable.id, parseInt(req.params.id as string))).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(fmt(row));
});

router.delete("/:id", requireAdmin, async (req, res) => {
  await db.delete(jobsTable).where(eq(jobsTable.id, parseInt(req.params.id as string)));
  res.status(204).end();
});

export default router;
