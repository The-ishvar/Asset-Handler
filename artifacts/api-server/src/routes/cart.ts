import { Router } from "express";
import { db } from "@workspace/db";
import { cartItemsTable, listingsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// GET /cart — get my cart items with listing details
router.get("/", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const items = await db.select().from(cartItemsTable).where(eq(cartItemsTable.userId, userId));
  const enriched = await Promise.all(items.map(async (item) => {
    const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, item.listingId)).limit(1);
    return { ...item, listing: listing ? { ...listing, price: parseFloat(listing.price as string), createdAt: listing.createdAt.toISOString() } : null };
  }));
  res.json(enriched.filter(i => i.listing));
});

// POST /cart — add listing to cart
router.post("/", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const { listingId } = req.body;
  if (!listingId) { res.status(400).json({ error: "listingId required" }); return; }

  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, parseInt(String(listingId)))).limit(1);
  if (!listing) { res.status(404).json({ error: "Listing not found" }); return; }
  if (listing.userId === userId) { res.status(400).json({ error: "Cannot add your own item to cart" }); return; }

  const existing = await db.select().from(cartItemsTable).where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.listingId, parseInt(String(listingId))))).limit(1);
  if (existing.length > 0) { res.status(400).json({ error: "Already in cart" }); return; }

  const [item] = await db.insert(cartItemsTable).values({ userId, listingId: parseInt(String(listingId)) }).returning();
  res.status(201).json(item);
});

// DELETE /cart/:listingId — remove from cart
router.delete("/:listingId", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const listingId = parseInt(req.params.listingId as string);
  await db.delete(cartItemsTable).where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.listingId, listingId)));
  res.status(204).end();
});

export default router;
