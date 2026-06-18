import { Router } from "express";
import { db } from "@workspace/db";
import { schoolsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

function fmt(s: typeof schoolsTable.$inferSelect) {
  return { ...s, createdAt: s.createdAt.toISOString() };
}

router.get("/", async (req, res) => {
  const rows = await db.select().from(schoolsTable).orderBy(schoolsTable.name);
  res.json(rows.map(fmt));
});

router.post("/", requireAdmin, async (req, res) => {
  const { name, photoUrl, address, contactNumber, classInfo, feeInfo, mapLocation } = req.body;
  if (!name || !address || !contactNumber) {
    res.status(400).json({ error: "name, address, contactNumber required" });
    return;
  }
  const [row] = await db.insert(schoolsTable).values({ name, photoUrl, address, contactNumber, classInfo, feeInfo, mapLocation }).returning();
  res.status(201).json(fmt(row));
});

router.get("/:id", async (req, res) => {
  const [row] = await db.select().from(schoolsTable).where(eq(schoolsTable.id, parseInt(req.params.id as string))).limit(1);
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(fmt(row));
});

router.patch("/:id", requireAdmin, async (req, res) => {
  const { name, photoUrl, address, contactNumber, classInfo, feeInfo, mapLocation } = req.body;
  const updates: Partial<typeof schoolsTable.$inferInsert> = {};
  if (name !== undefined) updates.name = name;
  if (photoUrl !== undefined) updates.photoUrl = photoUrl;
  if (address !== undefined) updates.address = address;
  if (contactNumber !== undefined) updates.contactNumber = contactNumber;
  if (classInfo !== undefined) updates.classInfo = classInfo;
  if (feeInfo !== undefined) updates.feeInfo = feeInfo;
  if (mapLocation !== undefined) updates.mapLocation = mapLocation;
  const [row] = await db.update(schoolsTable).set(updates).where(eq(schoolsTable.id, parseInt(req.params.id as string))).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(fmt(row));
});

router.delete("/:id", requireAdmin, async (req, res) => {
  await db.delete(schoolsTable).where(eq(schoolsTable.id, parseInt(req.params.id as string)));
  res.status(204).end();
});

export default router;
