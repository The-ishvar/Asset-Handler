import { Router } from "express";
import { db } from "@workspace/db";
import { postsTable, postLikesTable, postCommentsTable, usersTable } from "@workspace/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { requireAuth, optionalAuth } from "../middlewares/auth";

const router = Router();

// List posts
router.get("/posts", optionalAuth, async (req: any, res) => {
  try {
    const posts = await db.select({
      id: postsTable.id,
      content: postsTable.content,
      mediaUrls: postsTable.mediaUrls,
      tags: postsTable.tags,
      likesCount: postsTable.likesCount,
      commentsCount: postsTable.commentsCount,
      createdAt: postsTable.createdAt,
      userId: postsTable.userId,
      userName: usersTable.name,
      userAvatar: usersTable.avatarUrl,
    }).from(postsTable)
      .leftJoin(usersTable, eq(postsTable.userId, usersTable.id))
      .orderBy(desc(postsTable.createdAt))
      .limit(50);

    // Check if current user liked each post
    if (req.user) {
      const likes = await db.select().from(postLikesTable).where(eq(postLikesTable.userId, req.user.id));
      const likedSet = new Set(likes.map((l) => l.postId));
      return res.json(posts.map((p) => ({ ...p, likedByMe: likedSet.has(p.id) })));
    }

    res.json(posts.map((p) => ({ ...p, likedByMe: false })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create post
router.post("/posts", requireAuth, async (req: any, res) => {
  try {
    const { content, mediaUrls, tags } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: "Content is required" });
    const [post] = await db.insert(postsTable).values({
      userId: req.user.id,
      content: content.trim(),
      mediaUrls: mediaUrls ? JSON.stringify(mediaUrls) : null,
      tags: tags || null,
    }).returning();
    res.json(post);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete post
router.delete("/posts/:id", requireAuth, async (req: any, res) => {
  try {
    const id = Number(req.params.id);
    const [post] = await db.select().from(postsTable).where(eq(postsTable.id, id)).limit(1);
    if (!post) return res.status(404).json({ error: "Not found" });
    if (post.userId !== req.user.id && req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    await db.delete(postLikesTable).where(eq(postLikesTable.postId, id));
    await db.delete(postCommentsTable).where(eq(postCommentsTable.postId, id));
    await db.delete(postsTable).where(eq(postsTable.id, id));
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Like / Unlike post
router.post("/posts/:id/like", requireAuth, async (req: any, res) => {
  try {
    const postId = Number(req.params.id);
    const existing = await db.select().from(postLikesTable)
      .where(and(eq(postLikesTable.postId, postId), eq(postLikesTable.userId, req.user.id)))
      .limit(1);
    if (existing.length) {
      await db.delete(postLikesTable).where(and(eq(postLikesTable.postId, postId), eq(postLikesTable.userId, req.user.id)));
      await db.update(postsTable).set({ likesCount: sql`${postsTable.likesCount} - 1` }).where(eq(postsTable.id, postId));
      res.json({ liked: false });
    } else {
      await db.insert(postLikesTable).values({ postId, userId: req.user.id });
      await db.update(postsTable).set({ likesCount: sql`${postsTable.likesCount} + 1` }).where(eq(postsTable.id, postId));
      res.json({ liked: true });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get comments
router.get("/posts/:id/comments", optionalAuth, async (req: any, res) => {
  try {
    const postId = Number(req.params.id);
    const comments = await db.select({
      id: postCommentsTable.id,
      content: postCommentsTable.content,
      createdAt: postCommentsTable.createdAt,
      userId: postCommentsTable.userId,
      userName: usersTable.name,
      userAvatar: usersTable.avatarUrl,
    }).from(postCommentsTable)
      .leftJoin(usersTable, eq(postCommentsTable.userId, usersTable.id))
      .where(eq(postCommentsTable.postId, postId))
      .orderBy(postCommentsTable.createdAt);
    res.json(comments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Add comment
router.post("/posts/:id/comments", requireAuth, async (req: any, res) => {
  try {
    const postId = Number(req.params.id);
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: "Comment cannot be empty" });
    const [comment] = await db.insert(postCommentsTable).values({
      postId,
      userId: req.user.id,
      content: content.trim(),
    }).returning();
    await db.update(postsTable).set({ commentsCount: sql`${postsTable.commentsCount} + 1` }).where(eq(postsTable.id, postId));
    res.json(comment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
