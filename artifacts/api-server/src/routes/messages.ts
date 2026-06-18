import { Router } from "express";
import { db } from "@workspace/db";
import { messagesTable, usersTable, notificationsTable } from "@workspace/db";
import { eq, or, and, desc, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

function fmt(m: typeof messagesTable.$inferSelect) {
  return { ...m, createdAt: m.createdAt.toISOString() };
}

// GET /messages — get list of conversations
router.get("/", requireAuth, async (req, res) => {
  const userId = req.user!.userId;

  // Get all messages involving this user
  const allMessages = await db.select().from(messagesTable)
    .where(or(eq(messagesTable.senderId, userId), eq(messagesTable.receiverId, userId)))
    .orderBy(desc(messagesTable.createdAt));

  // Build conversation map (other user's id -> last message)
  const convMap = new Map<number, typeof allMessages[number]>();
  for (const msg of allMessages) {
    const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    if (!convMap.has(otherId)) convMap.set(otherId, msg);
  }

  // Fetch other users' info
  const conversations = await Promise.all(
    Array.from(convMap.entries()).map(async ([otherId, lastMsg]) => {
      const [other] = await db.select().from(usersTable).where(eq(usersTable.id, otherId)).limit(1);
      const unread = allMessages.filter(
        m => m.senderId === otherId && m.receiverId === userId && !m.isRead
      ).length;
      return {
        userId: otherId,
        userName: other?.name || "Unknown",
        userAvatarUrl: other?.avatarUrl || null,
        lastMessage: lastMsg.content,
        lastMessageAt: lastMsg.createdAt.toISOString(),
        unreadCount: unread,
      };
    })
  );

  res.json(conversations);
});

// GET /messages/:userId — get messages between current user and another user
router.get("/:userId", requireAuth, async (req, res) => {
  const myId = req.user!.userId;
  const otherId = parseInt(req.params.userId as string);

  const msgs = await db.select().from(messagesTable)
    .where(
      or(
        and(eq(messagesTable.senderId, myId), eq(messagesTable.receiverId, otherId)),
        and(eq(messagesTable.senderId, otherId), eq(messagesTable.receiverId, myId))
      )
    )
    .orderBy(messagesTable.createdAt);

  // Mark messages from other user as read
  await db.update(messagesTable)
    .set({ isRead: true })
    .where(and(eq(messagesTable.senderId, otherId), eq(messagesTable.receiverId, myId)));

  res.json(msgs.map(fmt));
});

// POST /messages — send a message
router.post("/", requireAuth, async (req, res) => {
  const { receiverId, content } = req.body;
  if (!receiverId || !content) {
    res.status(400).json({ error: "receiverId and content required" }); return;
  }
  const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId)).limit(1);
  const [msg] = await db.insert(messagesTable).values({
    senderId: req.user!.userId,
    receiverId: parseInt(String(receiverId)),
    senderName: sender?.name,
    content,
  }).returning();

  // Create notification for receiver
  await db.insert(notificationsTable).values({
    userId: parseInt(String(receiverId)),
    type: "message",
    content: `${sender?.name || "Someone"} sent you a message`,
    fromUserId: req.user!.userId,
    fromUserName: sender?.name,
    fromUserAvatar: sender?.avatarUrl,
    link: `/messages/${req.user!.userId}`,
  });

  res.status(201).json(fmt(msg));
});

export default router;
