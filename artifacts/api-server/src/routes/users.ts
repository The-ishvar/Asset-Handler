import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq, ilike, or } from "drizzle-orm";
import { requireAdmin, requireAuth } from "../middlewares/auth";

const router = Router();

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? null,
    avatarUrl: user.avatarUrl ?? null,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
}

// Search users (public - for finding people to snap/follow)
router.get("/search", async (req, res) => {
  try {
    const q = (req.query.q as string || "").trim();
    if (!q || q.length < 2) return res.json([]);
    const users = await db.select().from(usersTable)
      .where(or(ilike(usersTable.name, `%${q}%`), ilike(usersTable.phone, `%${q}%`)))
      .limit(20);
    res.json(users.map(formatUser));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", requireAdmin, async (req, res) => {
  const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
  res.json(users.map(formatUser));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id as string);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(formatUser(user));
});

router.patch("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (req.user!.userId !== id && req.user!.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const { name, phone, avatarUrl } = req.body;
  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(formatUser(user));
});

router.delete("/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id as string);
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.status(204).end();
});

export default router;
