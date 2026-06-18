import { Router } from "express";
import { db } from "@workspace/db";
import { listingsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();

function fmt(s: typeof listingsTable.$inferSelect) {
  return {
    ...s,
    price: parseFloat(s.price as string),
    createdAt: s.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const { status, userId } = req.query;
  const conditions = [];
  if (status) conditions.push(eq(listingsTable.status, status as "pending" | "approved" | "rejected"));
  if (userId) conditions.push(eq(listingsTable.userId, parseInt(userId as string)));
  const rows = conditions.length > 0
    ? await db.select().from(listingsTable).where(and(...conditions)).orderBy(listingsTable.createdAt)
    : await db.select().from(listingsTable).orderBy(listingsTable.createdAt);
  res.json(rows.map(fmt));
});

router.post("/", requireAuth, async (req, res) => {
  const { title, description, photoUrl, price, contactInfo } = req.body;
  if (!title || price === undefined || !contactInfo) {
    res.status(400).json({ error: "title, price, contactInfo required" });
    return;
  }
  const [row] = await db.insert(listingsTable).values({
    title,
    description,
    photoUrl,
    price: String(price),
    contactInfo,
    status: "pending",
    userId: req.user!.userId,
  }).returning();
  res.status(201).json(fmt(row));
});

router.get("/:id", async (req, res) => {
  const [row] = await db.select().from(listingsTable).where(eq(listingsTable.id, parseInt(req.params.id as string))).limit(1);
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(fmt(row));
});

router.patch("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const [existing] = await db.select().from(listingsTable).where(eq(listingsTable.id, id)).limit(1);
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }
  if (req.user!.userId !== existing.userId && req.user!.role !== "admin") {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  const updates: Partial<typeof listingsTable.$inferInsert> = {};
  const { title, description, photoUrl, price, contactInfo } = req.body;
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (photoUrl !== undefined) updates.photoUrl = photoUrl;
  if (price !== undefined) updates.price = String(price);
  if (contactInfo !== undefined) updates.contactInfo = contactInfo;
  const [row] = await db.update(listingsTable).set(updates).where(eq(listingsTable.id, id)).returning();
  res.json(fmt(row));
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const [existing] = await db.select().from(listingsTable).where(eq(listingsTable.id, id)).limit(1);
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }
  if (req.user!.userId !== existing.userId && req.user!.role !== "admin") {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  await db.delete(listingsTable).where(eq(listingsTable.id, id));
  res.status(204).end();
});

router.patch("/:id/approve", requireAdmin, async (req, res) => {
  const { status } = req.body;
  if (!status || !["approved", "rejected"].includes(status)) {
    res.status(400).json({ error: "status must be approved or rejected" }); return;
  }
  const [row] = await db.update(listingsTable).set({ status }).where(eq(listingsTable.id, parseInt(req.params.id as string))).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(fmt(row));
});

export default router;
