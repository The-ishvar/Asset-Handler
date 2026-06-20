import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, listingsTable, usersTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

function fmt(o: typeof ordersTable.$inferSelect) {
  return { ...o, totalAmount: parseFloat(o.totalAmount as string), createdAt: o.createdAt.toISOString() };
}

router.post("/", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const { listingId, quantity = 1, deliveryAddress, paymentMethod = "cod", notes } = req.body;
  if (!listingId) { res.status(400).json({ error: "listingId required" }); return; }

  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, parseInt(String(listingId)))).limit(1);
  if (!listing) { res.status(404).json({ error: "Listing not found" }); return; }
  if (listing.userId === userId) { res.status(400).json({ error: "Cannot order your own listing" }); return; }

  const [userRow] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  const qty = parseInt(String(quantity));
  const price = parseFloat(listing.price as string);
  const total = price * qty;

  const [order] = await db.insert(ordersTable).values({
    userId,
    listingId: parseInt(String(listingId)),
    sellerId: listing.userId!,
    quantity: qty,
    totalAmount: String(total),
    deliveryAddress: deliveryAddress || null,
    paymentMethod,
    status: "confirmed",
    buyerName: userRow?.name || null,
    buyerPhone: userRow?.phone || null,
    listingTitle: listing.title,
    notes: notes || null,
  }).returning();

  res.status(201).json(fmt(order));
});

router.get("/", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const orders = await db.select().from(ordersTable).where(eq(ordersTable.userId, userId));
  res.json(orders.map(fmt));
});

router.get("/selling", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const orders = await db.select().from(ordersTable).where(eq(ordersTable.sellerId, userId));
  res.json(orders.map(fmt));
});

router.patch("/:id/status", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const { status } = req.body;
  const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) { res.status(400).json({ error: "Invalid status" }); return; }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id)).limit(1);
  if (!order) { res.status(404).json({ error: "Not found" }); return; }
  if (order.sellerId !== req.user!.userId && order.userId !== req.user!.userId) {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  const [updated] = await db.update(ordersTable).set({ status }).where(eq(ordersTable.id, id)).returning();
  res.json(fmt(updated));
});

export default router;
