import { Router } from "express";
import { db } from "@workspace/db";
import { snapsTable, usersTable } from "@workspace/db/schema";
import { eq, and, or, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { emitToUser } from "../lib/socket";

const router = Router();

// Send a snap (single)
router.post("/snaps", requireAuth, async (req: any, res) => {
  try {
    const { receiverId, mediaUrl, caption } = req.body;
    if (!receiverId) return res.status(400).json({ error: "receiverId required" });
    if (!mediaUrl && !caption) return res.status(400).json({ error: "mediaUrl or caption required" });
    const [snap] = await db.insert(snapsTable).values({
      senderId: req.user.id,
      receiverId: Number(receiverId),
      mediaUrl: mediaUrl || null,
      caption: caption || null,
    }).returning();
    // Notify receiver in real-time
    emitToUser(Number(receiverId), "new_snap", { senderId: req.user.userId });
    res.json(snap);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Send snap to multiple recipients at once
router.post("/snaps/bulk", requireAuth, async (req: any, res) => {
  try {
    const { receiverIds, mediaUrl, caption } = req.body;
    if (!receiverIds || !Array.isArray(receiverIds) || receiverIds.length === 0) {
      return res.status(400).json({ error: "receiverIds array required" });
    }
    if (!mediaUrl && !caption) return res.status(400).json({ error: "mediaUrl or caption required" });

    const rows = receiverIds.map((rid: number) => ({
      senderId: req.user.id,
      receiverId: Number(rid),
      mediaUrl: mediaUrl || null,
      caption: caption || null,
    }));

    const snaps = await db.insert(snapsTable).values(rows).returning();

    // Notify each receiver in real-time
    for (const rid of receiverIds) {
      emitToUser(Number(rid), "new_snap", { senderId: req.user.userId });
    }

    res.json({ sent: snaps.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get my received snaps (excludes snaps already deleted from inbox after viewing)
router.get("/snaps/inbox", requireAuth, async (req: any, res) => {
  try {
    const snaps = await db.select({
      id: snapsTable.id,
      mediaUrl: snapsTable.mediaUrl,
      caption: snapsTable.caption,
      viewed: snapsTable.viewed,
      createdAt: snapsTable.createdAt,
      senderId: snapsTable.senderId,
      senderName: usersTable.name,
      senderAvatar: usersTable.avatarUrl,
    }).from(snapsTable)
      .leftJoin(usersTable, eq(snapsTable.senderId, usersTable.id))
      .where(and(eq(snapsTable.receiverId, req.user.id), eq(snapsTable.deletedFromInbox, false)))
      .orderBy(desc(snapsTable.createdAt));
    res.json(snaps);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get my sent snaps
router.get("/snaps/sent", requireAuth, async (req: any, res) => {
  try {
    const snaps = await db.select({
      id: snapsTable.id,
      mediaUrl: snapsTable.mediaUrl,
      caption: snapsTable.caption,
      viewed: snapsTable.viewed,
      deletedFromInbox: snapsTable.deletedFromInbox,
      createdAt: snapsTable.createdAt,
      receiverId: snapsTable.receiverId,
      receiverName: usersTable.name,
      receiverAvatar: usersTable.avatarUrl,
    }).from(snapsTable)
      .leftJoin(usersTable, eq(snapsTable.receiverId, usersTable.id))
      .where(eq(snapsTable.senderId, req.user.id))
      .orderBy(desc(snapsTable.createdAt));
    res.json(snaps);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mark snap as viewed and remove it from receiver's inbox (Snapchat-style)
router.post("/snaps/:id/view", requireAuth, async (req: any, res) => {
  try {
    const id = Number(req.params.id);
    await db.update(snapsTable)
      .set({ viewed: true, viewedAt: new Date(), deletedFromInbox: true })
      .where(and(eq(snapsTable.id, id), eq(snapsTable.receiverId, req.user.id)));
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a snap
router.delete("/snaps/:id", requireAuth, async (req: any, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(snapsTable)
      .where(and(eq(snapsTable.id, id), eq(snapsTable.senderId, req.user.id)));
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
