import { Router } from "express";
import { db } from "@workspace/db";
import {
  usersTable, followsTable, reelsTable, listingsTable, notificationsTable
} from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth, optionalAuth } from "../middlewares/auth";

const router = Router();

function fmtUser(u: typeof usersTable.$inferSelect) {
  const { passwordHash: _ph, ...rest } = u as any;
  return { ...rest, createdAt: u.createdAt.toISOString() };
}

// GET /users/:id/profile — public profile with social stats
router.get("/users/:id/profile", optionalAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const followers = await db.select().from(followsTable).where(eq(followsTable.followingId, id));
  const following = await db.select().from(followsTable).where(eq(followsTable.followerId, id));
  const posts = await db.select().from(listingsTable).where(eq(listingsTable.userId, id));
  const reels = await db.select().from(reelsTable).where(eq(reelsTable.userId, id));

  const isFollowing = req.user
    ? followers.some(f => f.followerId === req.user!.userId)
    : false;

  const { passwordHash: _ph, ...safeUser } = user as any;
  res.json({
    ...safeUser,
    createdAt: user.createdAt.toISOString(),
    followerCount: followers.length,
    followingCount: following.length,
    postCount: posts.length,
    reelCount: reels.length,
    isFollowing,
  });
});

// POST /users/:id/follow — toggle follow
router.post("/users/:id/follow", requireAuth, async (req, res) => {
  const followingId = parseInt(req.params.id as string);
  const followerId = req.user!.userId;

  if (followerId === followingId) {
    res.status(400).json({ error: "Cannot follow yourself" }); return;
  }

  const [existing] = await db.select().from(followsTable)
    .where(and(eq(followsTable.followerId, followerId), eq(followsTable.followingId, followingId)))
    .limit(1);

  if (existing) {
    await db.delete(followsTable).where(eq(followsTable.id, existing.id));
  } else {
    await db.insert(followsTable).values({ followerId, followingId });
    // Notify
    const [follower] = await db.select().from(usersTable).where(eq(usersTable.id, followerId)).limit(1);
    await db.insert(notificationsTable).values({
      userId: followingId,
      type: "follow",
      content: `${follower?.name || "Someone"} started following you`,
      fromUserId: followerId,
      fromUserName: follower?.name,
      fromUserAvatar: follower?.avatarUrl,
      link: `/profile/${followerId}`,
    });
  }

  const followers = await db.select().from(followsTable).where(eq(followsTable.followingId, followingId));
  res.json({ following: !existing, followerCount: followers.length });
});

// GET /users/me/following — list of users I follow (with their profile info)
router.get("/users/me/following", requireAuth, async (req, res) => {
  try {
    const followerId = req.user!.userId;
    const rows = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        avatarUrl: usersTable.avatarUrl,
      })
      .from(followsTable)
      .leftJoin(usersTable, eq(followsTable.followingId, usersTable.id))
      .where(eq(followsTable.followerId, followerId));
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /users/me/update-profile — update own bio, avatar, cover
router.patch("/users/me/update-profile", requireAuth, async (req, res) => {
  const { bio, avatarUrl, coverUrl } = req.body;
  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (bio !== undefined) updates.bio = bio;
  if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
  if (coverUrl !== undefined) updates.coverUrl = coverUrl;

  const [updated] = await db.update(usersTable).set(updates)
    .where(eq(usersTable.id, req.user!.userId)).returning();
  res.json(fmtUser(updated));
});

export default router;
