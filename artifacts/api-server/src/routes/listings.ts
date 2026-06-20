import { Router } from "express";
import { db } from "@workspace/db";
import { listingsTable, listingReviewsTable, usersTable } from "@workspace/db";
import { eq, and, avg, count } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();

function fmt(s: typeof listingsTable.$inferSelect) {
  return {
    ...s,
    price: parseFloat(s.price as string),
    discountPrice: s.discountPrice ? parseFloat(s.discountPrice as string) : null,
    createdAt: s.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const { status, userId, category } = req.query;
  let rows = await db.select().from(listingsTable).orderBy(listingsTable.createdAt);
  if (status) rows = rows.filter((r) => r.status === status);
  if (userId) rows = rows.filter((r) => r.userId === parseInt(userId as string));
  if (category && category !== "All") rows = rows.filter((r) => r.category === category);
  res.json(rows.map(fmt));
});

router.post("/", requireAuth, async (req, res) => {
  const { title, description, photoUrl, price, discountPrice, contactInfo, category, location, quantity, deliveryAvailable } = req.body;
  if (!title || price === undefined || !contactInfo) {
    res.status(400).json({ error: "title, price, contactInfo required" });
    return;
  }

  const [userRow] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId)).limit(1);

  const [row] = await db.insert(listingsTable).values({
    title,
    description: description || null,
    photoUrl: photoUrl || null,
    price: String(price),
    discountPrice: discountPrice ? String(discountPrice) : null,
    contactInfo,
    status: "approved",
    category: category || "Others",
    location: location || null,
    quantity: quantity ? parseInt(String(quantity)) : 1,
    deliveryAvailable: deliveryAvailable === true || deliveryAvailable === "true",
    isSoldOut: false,
    userId: req.user!.userId,
    userName: userRow?.name || null,
    userAvatar: userRow?.avatarUrl || null,
  }).returning();

  res.status(201).json(fmt(row));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id as string);
  const [row] = await db.select().from(listingsTable).where(eq(listingsTable.id, id)).limit(1);
  if (!row) { res.status(404).json({ error: "Not found" }); return; }

  const reviews = await db.select().from(listingReviewsTable).where(eq(listingReviewsTable.listingId, id));
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  res.json({ ...fmt(row), reviewCount: reviews.length, avgRating: Math.round(avgRating * 10) / 10 });
});

router.patch("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const [existing] = await db.select().from(listingsTable).where(eq(listingsTable.id, id)).limit(1);
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }
  if (req.user!.userId !== existing.userId && req.user!.role !== "admin" && req.user!.role !== "super_admin") {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  const updates: Partial<typeof listingsTable.$inferInsert> = {};
  const { title, description, photoUrl, price, discountPrice, contactInfo, category, location, quantity, deliveryAvailable, isSoldOut } = req.body;
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (photoUrl !== undefined) updates.photoUrl = photoUrl;
  if (price !== undefined) updates.price = String(price);
  if (discountPrice !== undefined) updates.discountPrice = discountPrice ? String(discountPrice) : null;
  if (contactInfo !== undefined) updates.contactInfo = contactInfo;
  if (category !== undefined) updates.category = category;
  if (location !== undefined) updates.location = location;
  if (quantity !== undefined) updates.quantity = parseInt(String(quantity));
  if (deliveryAvailable !== undefined) updates.deliveryAvailable = deliveryAvailable === true || deliveryAvailable === "true";
  if (isSoldOut !== undefined) updates.isSoldOut = isSoldOut === true || isSoldOut === "true";
  const [row] = await db.update(listingsTable).set(updates).where(eq(listingsTable.id, id)).returning();
  res.json(fmt(row));
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const [existing] = await db.select().from(listingsTable).where(eq(listingsTable.id, id)).limit(1);
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }
  if (req.user!.userId !== existing.userId && req.user!.role !== "admin" && req.user!.role !== "super_admin") {
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

router.get("/:id/reviews", async (req, res) => {
  const id = parseInt(req.params.id as string);
  const reviews = await db.select().from(listingReviewsTable)
    .where(eq(listingReviewsTable.listingId, id))
    .orderBy(listingReviewsTable.createdAt);
  res.json(reviews.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
});

router.post("/:id/reviews", requireAuth, async (req, res) => {
  const listingId = parseInt(req.params.id as string);
  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    res.status(400).json({ error: "rating must be 1-5" }); return;
  }
  const [userRow] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId)).limit(1);
  const [row] = await db.insert(listingReviewsTable).values({
    userId: req.user!.userId,
    listingId,
    rating: parseInt(String(rating)),
    comment: comment || null,
    userName: userRow?.name || null,
    userAvatar: userRow?.avatarUrl || null,
  }).returning();
  res.status(201).json({ ...row, createdAt: row.createdAt.toISOString() });
});

export default router;
