import { Router } from "express";
import { db } from "@workspace/db";
import { userShopsTable, userShopItemsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

function fmtItem(item: typeof userShopItemsTable.$inferSelect) {
  return { ...item, price: parseFloat(item.price as string), createdAt: item.createdAt.toISOString() };
}

function fmtShop(shop: typeof userShopsTable.$inferSelect) {
  return { ...shop, createdAt: shop.createdAt.toISOString() };
}

// GET /user-shops — list all user shops
router.get("/", async (req, res) => {
  const shops = await db.select().from(userShopsTable).orderBy(userShopsTable.createdAt);
  const enriched = await Promise.all(shops.map(async (shop) => {
    const [owner] = await db.select().from(usersTable).where(eq(usersTable.id, shop.userId)).limit(1);
    return { ...fmtShop(shop), ownerName: owner?.name || "Unknown", ownerAvatar: owner?.avatarUrl || null };
  }));
  res.json(enriched);
});

// GET /user-shops/my — get my shop
router.get("/my", requireAuth, async (req, res) => {
  const [shop] = await db.select().from(userShopsTable).where(eq(userShopsTable.userId, req.user!.userId)).limit(1);
  if (!shop) { res.json(null); return; }
  const items = await db.select().from(userShopItemsTable).where(eq(userShopItemsTable.shopId, shop.id)).orderBy(userShopItemsTable.createdAt);
  res.json({ ...fmtShop(shop), items: items.map(fmtItem) });
});

// POST /user-shops — create my shop
router.post("/", requireAuth, async (req, res) => {
  const existing = await db.select().from(userShopsTable).where(eq(userShopsTable.userId, req.user!.userId)).limit(1);
  if (existing.length > 0) { res.status(400).json({ error: "You already have a shop" }); return; }
  const { name, description } = req.body;
  if (!name) { res.status(400).json({ error: "name required" }); return; }
  const [shop] = await db.insert(userShopsTable).values({ userId: req.user!.userId, name, description }).returning();
  res.status(201).json(fmtShop(shop));
});

// PATCH /user-shops/my — update my shop info
router.patch("/my", requireAuth, async (req, res) => {
  const { name, description } = req.body;
  const updates: any = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  const [shop] = await db.update(userShopsTable).set(updates).where(eq(userShopsTable.userId, req.user!.userId)).returning();
  if (!shop) { res.status(404).json({ error: "Shop not found" }); return; }
  res.json(fmtShop(shop));
});

// GET /user-shops/:id — get shop by id with items
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id as string);
  const [shop] = await db.select().from(userShopsTable).where(eq(userShopsTable.id, id)).limit(1);
  if (!shop) { res.status(404).json({ error: "Shop not found" }); return; }
  const items = await db.select().from(userShopItemsTable).where(eq(userShopItemsTable.shopId, id)).orderBy(userShopItemsTable.createdAt);
  const [owner] = await db.select().from(usersTable).where(eq(usersTable.id, shop.userId)).limit(1);
  res.json({ ...fmtShop(shop), ownerName: owner?.name || "Unknown", ownerAvatar: owner?.avatarUrl || null, items: items.map(fmtItem) });
});

// POST /user-shops/my/items — add item to my shop
router.post("/my/items", requireAuth, async (req, res) => {
  const [shop] = await db.select().from(userShopsTable).where(eq(userShopsTable.userId, req.user!.userId)).limit(1);
  if (!shop) { res.status(404).json({ error: "Create your shop first" }); return; }
  const { title, description, price, photos } = req.body;
  if (!title || price === undefined) { res.status(400).json({ error: "title and price required" }); return; }
  const [item] = await db.insert(userShopItemsTable).values({ shopId: shop.id, title, description, price: String(price), photos }).returning();
  res.status(201).json(fmtItem(item));
});

// DELETE /user-shops/my/items/:itemId — remove item from my shop
router.delete("/my/items/:itemId", requireAuth, async (req, res) => {
  const itemId = parseInt(req.params.itemId as string);
  const [item] = await db.select().from(userShopItemsTable).where(eq(userShopItemsTable.id, itemId)).limit(1);
  if (!item) { res.status(404).json({ error: "Item not found" }); return; }
  const [shop] = await db.select().from(userShopsTable).where(eq(userShopsTable.id, item.shopId)).limit(1);
  if (!shop || shop.userId !== req.user!.userId) { res.status(403).json({ error: "Forbidden" }); return; }
  await db.delete(userShopItemsTable).where(eq(userShopItemsTable.id, itemId));
  res.status(204).end();
});

export default router;
