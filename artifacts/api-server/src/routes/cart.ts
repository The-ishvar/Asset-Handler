import { Router } from "express";
import { db } from "@workspace/db";
import { cartItemsTable, listingsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

function fmtListing(l: typeof listingsTable.$inferSelect) {
  return {
    ...l,
    price: parseFloat(l.price as string),
    discountPrice: l.discountPrice ? parseFloat(l.discountPrice as string) : null,
    createdAt: l.createdAt.toISOString(),
  };
}

router.get("/", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const items = await db.select().from(cartItemsTable).where(eq(cartItemsTable.userId, userId));
  const enriched = await Promise.all(items.map(async (item) => {
    const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, item.listingId)).limit(1);
    return { ...item, listing: listing ? fmtListing(listing) : null };
  }));
  res.json(enriched.filter((i) => i.listing));
});

router.post("/", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const { listingId, quantity = 1 } = req.body;
  if (!listingId) { res.status(400).json({ error: "listingId required" }); return; }

  const lid = parseInt(String(listingId));
  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, lid)).limit(1);
  if (!listing) { res.status(404).json({ error: "Listing not found" }); return; }
  if (listing.userId === userId) { res.status(400).json({ error: "Cannot add your own item to cart" }); return; }

  const existing = await db.select().from(cartItemsTable)
    .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.listingId, lid))).limit(1);

  if (existing.length > 0) {
    const [updated] = await db.update(cartItemsTable)
      .set({ quantity: existing[0].quantity + parseInt(String(quantity)) })
      .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.listingId, lid)))
      .returning();
    res.json(updated);
    return;
  }

  const [item] = await db.insert(cartItemsTable).values({ userId, listingId: lid, quantity: parseInt(String(quantity)) }).returning();
  res.status(201).json(item);
});

router.patch("/:listingId", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const listingId = parseInt(req.params.listingId as string);
  const { quantity } = req.body;
  if (!quantity || quantity < 1) { res.status(400).json({ error: "quantity must be >= 1" }); return; }
  const [updated] = await db.update(cartItemsTable)
    .set({ quantity: parseInt(String(quantity)) })
    .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.listingId, listingId)))
    .returning();
  if (!updated) { res.status(404).json({ error: "Item not in cart" }); return; }
  res.json(updated);
});

router.delete("/:listingId", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const listingId = parseInt(req.params.listingId as string);
  await db.delete(cartItemsTable).where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.listingId, listingId)));
  res.status(204).end();
});

export default router;
