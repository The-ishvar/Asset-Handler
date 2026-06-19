import { Router } from "express";
import { db } from "@workspace/db";
import { storiesTable, storyViewsTable, usersTable } from "@workspace/db";
import { eq, sql, and, gt } from "drizzle-orm";
import { requireAuth, optionalAuth } from "../middlewares/auth";

const router = Router();

function nowPlusSix() {
  const d = new Date();
  d.setHours(d.getHours() + 6);
  return d;
}

router.get("/", optionalAuth, async (req, res) => {
  try {
    const now = new Date();
    const stories = await db
      .select()
      .from(storiesTable)
      .where(gt(storiesTable.expiresAt, now))
      .orderBy(sql`${storiesTable.createdAt} DESC`);

    res.json(stories.map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      expiresAt: s.expiresAt.toISOString(),
    })));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stories" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { mediaUrl, mediaType, caption } = req.body;
    if (!mediaUrl) {
      res.status(400).json({ error: "mediaUrl is required" });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.user!.userId))
      .limit(1);

    const [story] = await db
      .insert(storiesTable)
      .values({
        userId: req.user!.userId,
        userName: user?.name ?? null,
        userAvatarUrl: user?.avatarUrl ?? null,
        mediaUrl,
        mediaType: mediaType || "image",
        caption: caption || null,
        viewCount: 0,
        expiresAt: nowPlusSix(),
      })
      .returning();

    res.status(201).json({
      ...story,
      createdAt: story.createdAt.toISOString(),
      expiresAt: story.expiresAt.toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to create story" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    const [story] = await db
      .select()
      .from(storiesTable)
      .where(eq(storiesTable.id, id))
      .limit(1);

    if (!story) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    if (story.userId !== req.user!.userId && req.user!.role !== "admin" && req.user!.role !== "super_admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    await db.delete(storyViewsTable).where(eq(storyViewsTable.storyId, id));
    await db.delete(storiesTable).where(eq(storiesTable.id, id));
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete story" });
  }
});

router.post("/:id/view", optionalAuth, async (req, res) => {
  try {
    const storyId = parseInt(req.params.id as string);
    const viewerId = req.user?.userId;

    if (viewerId) {
      const [existing] = await db
        .select()
        .from(storyViewsTable)
        .where(and(eq(storyViewsTable.storyId, storyId), eq(storyViewsTable.viewerId, viewerId)))
        .limit(1);

      if (!existing) {
        await db.insert(storyViewsTable).values({ storyId, viewerId });
        await db
          .update(storiesTable)
          .set({ viewCount: sql`${storiesTable.viewCount} + 1` })
          .where(eq(storiesTable.id, storyId));
      }
    } else {
      await db
        .update(storiesTable)
        .set({ viewCount: sql`${storiesTable.viewCount} + 1` })
        .where(eq(storiesTable.id, storyId));
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to record view" });
  }
});

export default router;
