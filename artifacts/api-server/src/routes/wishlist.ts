import { Router } from "express";
import { db } from "@workspace/db";
import { wishlistTable, listingsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const items = await db.select().from(wishlistTable).where(eq(wishlistTable.userId, userId));
  res.json(items.map((i) => i.listingId));
});

router.post("/", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const { listingId } = req.body;
  if (!listingId) { res.status(400).json({ error: "listingId required" }); return; }

  const lid = parseInt(String(listingId));
  const existing = await db.select().from(wishlistTable)
    .where(and(eq(wishlistTable.userId, userId), eq(wishlistTable.listingId, lid))).limit(1);

  if (existing.length > 0) {
    await db.delete(wishlistTable).where(and(eq(wishlistTable.userId, userId), eq(wishlistTable.listingId, lid)));
    res.json({ wishlisted: false });
    return;
  }

  await db.insert(wishlistTable).values({ userId, listingId: lid });
  res.json({ wishlisted: true });
});

router.delete("/:listingId", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const listingId = parseInt(req.params.listingId as string);
  await db.delete(wishlistTable).where(and(eq(wishlistTable.userId, userId), eq(wishlistTable.listingId, listingId)));
  res.status(204).end();
});

export default router;
