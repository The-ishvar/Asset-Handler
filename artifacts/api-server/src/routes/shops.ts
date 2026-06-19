import { Router } from "express";
import { db } from "@workspace/db";
import { shopsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

function fmt(s: typeof shopsTable.$inferSelect) {
  return {
    id: s.id,
    name: s.name,
    address: s.location,
    phone: s.contactNumber,
    type: s.availableItems ?? null,
    timing: null,
    description: null,
    photoUrl: s.photoUrl,
    contactNumber: s.contactNumber,
    location: s.location,
    mapLocation: s.mapLocation,
    createdAt: s.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const rows = await db.select().from(shopsTable).orderBy(shopsTable.name);
  res.json(rows.map(fmt));
});

router.post("/", requireAdmin, async (req, res) => {
  const { name, address, location, phone, contactNumber, type, availableItems, description, photoUrl, price, mapLocation } = req.body;
  if (!name) { res.status(400).json({ error: "name required" }); return; }
  const [row] = await db.insert(shopsTable).values({
    name,
    location: address || location || "",
    contactNumber: phone || contactNumber || "",
    availableItems: type || availableItems || null,
    photoUrl: photoUrl || null,
    price: price || null,
    mapLocation: mapLocation || null,
  }).returning();
  res.status(201).json(fmt(row));
});

router.get("/:id", async (req, res) => {
  const [row] = await db.select().from(shopsTable).where(eq(shopsTable.id, parseInt(req.params.id as string))).limit(1);
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(fmt(row));
});

router.patch("/:id", requireAdmin, async (req, res) => {
  const { name, address, location, phone, contactNumber, type, availableItems, photoUrl, price, mapLocation } = req.body;
  const updates: Partial<typeof shopsTable.$inferInsert> = {};
  if (name !== undefined) updates.name = name;
  if (address !== undefined || location !== undefined) updates.location = address ?? location;
  if (phone !== undefined || contactNumber !== undefined) updates.contactNumber = phone ?? contactNumber;
  if (type !== undefined || availableItems !== undefined) updates.availableItems = type ?? availableItems;
  if (photoUrl !== undefined) updates.photoUrl = photoUrl;
  if (price !== undefined) updates.price = price;
  if (mapLocation !== undefined) updates.mapLocation = mapLocation;
  const [row] = await db.update(shopsTable).set(updates).where(eq(shopsTable.id, parseInt(req.params.id as string))).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(fmt(row));
});

router.delete("/:id", requireAdmin, async (req, res) => {
  await db.delete(shopsTable).where(eq(shopsTable.id, parseInt(req.params.id as string)));
  res.status(204).end();
});

export default router;
