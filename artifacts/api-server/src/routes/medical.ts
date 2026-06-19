import { Router } from "express";
import { db } from "@workspace/db";
import { medicalStoresTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

function fmt(s: typeof medicalStoresTable.$inferSelect) {
  return {
    id: s.id,
    name: s.name,
    phone: s.contactNumber,
    address: s.location,
    description: s.availableMedicines ?? null,
    type: null,
    timing: null,
    contactNumber: s.contactNumber,
    location: s.location,
    mapLocation: s.mapLocation,
    createdAt: s.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const rows = await db.select().from(medicalStoresTable).orderBy(medicalStoresTable.name);
  res.json(rows.map(fmt));
});

router.post("/", requireAdmin, async (req, res) => {
  const { name, phone, contactNumber, address, location, description, availableMedicines, mapLocation } = req.body;
  if (!name) { res.status(400).json({ error: "name required" }); return; }
  const [row] = await db.insert(medicalStoresTable).values({
    name,
    contactNumber: phone || contactNumber || "",
    location: address || location || "",
    availableMedicines: description || availableMedicines || null,
    mapLocation: mapLocation || null,
  }).returning();
  res.status(201).json(fmt(row));
});

router.get("/:id", async (req, res) => {
  const [row] = await db.select().from(medicalStoresTable).where(eq(medicalStoresTable.id, parseInt(req.params.id as string))).limit(1);
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(fmt(row));
});

router.patch("/:id", requireAdmin, async (req, res) => {
  const { name, phone, contactNumber, address, location, description, availableMedicines, mapLocation } = req.body;
  const updates: Partial<typeof medicalStoresTable.$inferInsert> = {};
  if (name !== undefined) updates.name = name;
  if (phone !== undefined || contactNumber !== undefined) updates.contactNumber = phone ?? contactNumber;
  if (address !== undefined || location !== undefined) updates.location = address ?? location;
  if (description !== undefined || availableMedicines !== undefined) updates.availableMedicines = description ?? availableMedicines;
  if (mapLocation !== undefined) updates.mapLocation = mapLocation;
  const [row] = await db.update(medicalStoresTable).set(updates).where(eq(medicalStoresTable.id, parseInt(req.params.id as string))).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(fmt(row));
});

router.delete("/:id", requireAdmin, async (req, res) => {
  await db.delete(medicalStoresTable).where(eq(medicalStoresTable.id, parseInt(req.params.id as string)));
  res.status(204).end();
});

export default router;
