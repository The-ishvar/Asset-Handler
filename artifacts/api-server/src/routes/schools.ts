import { Router } from "express";
import { db } from "@workspace/db";
import { schoolsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

function fmt(s: typeof schoolsTable.$inferSelect) {
  return {
    id: s.id,
    name: s.name,
    address: s.address,
    phone: s.contactNumber,
    type: s.classInfo ?? null,
    timing: null,
    description: s.feeInfo ?? null,
    photoUrl: s.photoUrl,
    contactNumber: s.contactNumber,
    classInfo: s.classInfo,
    feeInfo: s.feeInfo,
    mapLocation: s.mapLocation,
    createdAt: s.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const rows = await db.select().from(schoolsTable).orderBy(schoolsTable.name);
  res.json(rows.map(fmt));
});

router.post("/", requireAdmin, async (req, res) => {
  const { name, address, phone, contactNumber, type, classInfo, timing, description, feeInfo, photoUrl, mapLocation } = req.body;
  if (!name) { res.status(400).json({ error: "name required" }); return; }
  const [row] = await db.insert(schoolsTable).values({
    name,
    address: address || "",
    contactNumber: phone || contactNumber || "",
    classInfo: type || classInfo || null,
    feeInfo: description || feeInfo || null,
    photoUrl: photoUrl || null,
    mapLocation: mapLocation || null,
  }).returning();
  res.status(201).json(fmt(row));
});

router.get("/:id", async (req, res) => {
  const [row] = await db.select().from(schoolsTable).where(eq(schoolsTable.id, parseInt(req.params.id as string))).limit(1);
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(fmt(row));
});

router.patch("/:id", requireAdmin, async (req, res) => {
  const { name, address, phone, contactNumber, type, classInfo, description, feeInfo, photoUrl, mapLocation } = req.body;
  const updates: Partial<typeof schoolsTable.$inferInsert> = {};
  if (name !== undefined) updates.name = name;
  if (address !== undefined) updates.address = address;
  if (phone !== undefined || contactNumber !== undefined) updates.contactNumber = phone ?? contactNumber;
  if (type !== undefined || classInfo !== undefined) updates.classInfo = type ?? classInfo;
  if (description !== undefined || feeInfo !== undefined) updates.feeInfo = description ?? feeInfo;
  if (photoUrl !== undefined) updates.photoUrl = photoUrl;
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
