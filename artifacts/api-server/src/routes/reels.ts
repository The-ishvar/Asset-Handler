import { Router } from "express";
import { db } from "@workspace/db";
import {
  reelsTable, reelLikesTable, reelCommentsTable,
  usersTable, notificationsTable
} from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth, optionalAuth } from "../middlewares/auth";

const router = Router();

function fmtReel(r: typeof reelsTable.$inferSelect, likeCount: number, commentCount: number, isLiked: boolean) {
  return {
    ...r,
    viewCount: r.viewCount ?? 0,
    likeCount,
    commentCount,
    isLiked,
    createdAt: r.createdAt.toISOString(),
  };
}

async function getReelWithStats(reelId: number, currentUserId?: number) {
  const [reel] = await db.select().from(reelsTable).where(eq(reelsTable.id, reelId)).limit(1);
  if (!reel) return null;
  const likes = await db.select().from(reelLikesTable).where(eq(reelLikesTable.reelId, reelId));
  const comments = await db.select().from(reelCommentsTable).where(eq(reelCommentsTable.reelId, reelId));
  const isLiked = currentUserId ? likes.some(l => l.userId === currentUserId) : false;
  return fmtReel(reel, likes.length, comments.length, isLiked);
}

router.get("/", optionalAuth, async (req, res) => {
  const { userId } = req.query;
  const reels = userId
    ? await db.select().from(reelsTable).where(eq(reelsTable.userId, parseInt(userId as string))).orderBy(sql`${reelsTable.createdAt} DESC`)
    : await db.select().from(reelsTable).orderBy(sql`${reelsTable.createdAt} DESC`);

  const results = await Promise.all(reels.map(async (reel) => {
    const likes = await db.select().from(reelLikesTable).where(eq(reelLikesTable.reelId, reel.id));
    const comments = await db.select().from(reelCommentsTable).where(eq(reelCommentsTable.reelId, reel.id));
    const isLiked = req.user ? likes.some(l => l.userId === req.user!.userId) : false;
    return fmtReel(reel, likes.length, comments.length, isLiked);
  }));

  res.json(results);
});

router.post("/", requireAuth, async (req, res) => {
  const { title, description, videoUrl, thumbnailUrl } = req.body;
  if (!title || !videoUrl) {
    res.status(400).json({ error: "title and videoUrl are required" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId)).limit(1);
  const [reel] = await db.insert(reelsTable).values({
    userId: req.user!.userId,
    userName: user?.name,
    userAvatarUrl: user?.avatarUrl,
    title,
    description: description || null,
    videoUrl,
    thumbnailUrl: thumbnailUrl || null,
    viewCount: 0,
  }).returning();
  res.status(201).json(fmtReel(reel, 0, 0, false));
});

router.get("/:id", optionalAuth, async (req, res) => {
  const result = await getReelWithStats(parseInt(req.params.id as string), req.user?.userId);
  if (!result) { res.status(404).json({ error: "Not found" }); return; }
  res.json(result);
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id as string);
  const [reel] = await db.select().from(reelsTable).where(eq(reelsTable.id, id)).limit(1);
  if (!reel) { res.status(404).json({ error: "Not found" }); return; }
  if (reel.userId !== req.user!.userId && req.user!.role !== "admin") {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  await db.delete(reelLikesTable).where(eq(reelLikesTable.reelId, id));
  await db.delete(reelCommentsTable).where(eq(reelCommentsTable.reelId, id));
  await db.delete(reelsTable).where(eq(reelsTable.id, id));
  res.status(204).end();
});

router.post("/:id/view", async (req, res) => {
  const id = parseInt(req.params.id as string);
  await db.update(reelsTable).set({ viewCount: sql`${reelsTable.viewCount} + 1` }).where(eq(reelsTable.id, id));
  res.json({ ok: true });
});

router.post("/:id/like", requireAuth, async (req, res) => {
  const reelId = parseInt(req.params.id as string);
  const userId = req.user!.userId;
  const [existing] = await db.select().from(reelLikesTable)
    .where(and(eq(reelLikesTable.reelId, reelId), eq(reelLikesTable.userId, userId))).limit(1);

  if (existing) {
    await db.delete(reelLikesTable).where(eq(reelLikesTable.id, existing.id));
  } else {
    await db.insert(reelLikesTable).values({ reelId, userId });
    // Notify reel owner
    const [reel] = await db.select().from(reelsTable).where(eq(reelsTable.id, reelId)).limit(1);
    const [liker] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (reel && reel.userId !== userId) {
      await db.insert(notificationsTable).values({
        userId: reel.userId,
        type: "like",
        content: `${liker?.name || "Someone"} liked your reel "${reel.title}"`,
        fromUserId: userId,
        fromUserName: liker?.name,
        fromUserAvatar: liker?.avatarUrl,
        link: `/reels`,
      });
    }
  }

  const likes = await db.select().from(reelLikesTable).where(eq(reelLikesTable.reelId, reelId));
  res.json({ liked: !existing, likeCount: likes.length });
});

router.get("/:id/comments", async (req, res) => {
  const reelId = parseInt(req.params.id as string);
  const comments = await db.select().from(reelCommentsTable)
    .where(eq(reelCommentsTable.reelId, reelId))
    .orderBy(reelCommentsTable.createdAt);
  res.json(comments.map(c => ({ ...c, createdAt: c.createdAt.toISOString() })));
});

router.post("/:id/comments", requireAuth, async (req, res) => {
  const reelId = parseInt(req.params.id as string);
  const { content } = req.body;
  if (!content) { res.status(400).json({ error: "content required" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId)).limit(1);
  const [comment] = await db.insert(reelCommentsTable).values({
    reelId,
    userId: req.user!.userId,
    userName: user?.name,
    userAvatarUrl: user?.avatarUrl,
    content,
  }).returning();

  // Notify reel owner
  const [reel] = await db.select().from(reelsTable).where(eq(reelsTable.id, reelId)).limit(1);
  if (reel && reel.userId !== req.user!.userId) {
    await db.insert(notificationsTable).values({
      userId: reel.userId,
      type: "comment",
      content: `${user?.name || "Someone"} commented on your reel: "${content.slice(0, 50)}"`,
      fromUserId: req.user!.userId,
      fromUserName: user?.name,
      fromUserAvatar: user?.avatarUrl,
      link: `/reels`,
    });
  }

  res.status(201).json({ ...comment, createdAt: comment.createdAt.toISOString() });
});

export default router;
