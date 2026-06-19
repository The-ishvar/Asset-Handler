import { Router } from "express";
import { db } from "@workspace/db";
import {
  bookingsTable, bookingStatusHistoryTable, providersTable,
  usersTable, notificationsTable
} from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { emitToUser } from "../lib/socket";
import QRCode from "qrcode";

const router = Router();

// ── Valid state machine transitions ──────────────────────────────────────────
// Terminal states cannot transition further
const TERMINAL_STATES = new Set(["completed", "cancelled", "rejected"]);
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending:   ["accepted", "rejected"],
  accepted:  ["confirmed", "rejected"],
  confirmed: ["completed"],
};

async function generateQR(bookingId: number, type: string): Promise<string> {
  const payload = JSON.stringify({ bookingId, type, app: "Bhaleri Online" });
  return QRCode.toDataURL(payload);
}

function fmtBooking(b: typeof bookingsTable.$inferSelect) {
  return {
    ...b,
    amount: String(b.amount),
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  };
}

async function recordHistory(
  bookingId: number,
  fromStatus: string | null,
  toStatus: string,
  changedBy: number,
  note?: string
) {
  await db.insert(bookingStatusHistoryTable).values({
    bookingId,
    fromStatus,
    toStatus,
    changedBy,
    note: note || null,
  });
}

async function notifyUser(userId: number, content: string, link: string, fromUserId?: number) {
  const [notif] = await db.insert(notificationsTable).values({
    userId,
    type: "booking",
    content,
    fromUserId: fromUserId || null,
    link,
  }).returning();
  emitToUser(userId, "notification", notif);
}

// ── IMPORTANT: All static routes MUST be declared before /:id ────────────────

// GET /bookings/mine
router.get("/mine", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const { type } = req.query;
    const rows = await db.select().from(bookingsTable)
      .where(
        type
          ? and(eq(bookingsTable.userId, userId), eq(bookingsTable.bookingType, type as any))
          : eq(bookingsTable.userId, userId)
      )
      .orderBy(desc(bookingsTable.createdAt));

    const withProviders = await Promise.all(rows.map(async (b) => {
      let providerName = null;
      if (b.providerId) {
        const [p] = await db.select().from(providersTable).where(eq(providersTable.id, b.providerId)).limit(1);
        providerName = p?.name || null;
      }
      return { ...fmtBooking(b), providerName };
    }));

    res.json(withProviders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// GET /bookings/providers/list — must be before /:id
router.get("/providers/list", async (req, res) => {
  try {
    const { type } = req.query;
    const rows = type
      ? await db.select().from(providersTable).where(and(eq(providersTable.type, type as any), eq(providersTable.isActive, 1)))
      : await db.select().from(providersTable).where(eq(providersTable.isActive, 1));
    res.json(rows.map(p => ({ ...p, createdAt: p.createdAt.toISOString() })));
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

// GET /bookings/provider/earnings — must be before /:id
router.get("/provider/earnings", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const [provider] = await db.select().from(providersTable)
      .where(eq(providersTable.userId, userId)).limit(1);

    if (!provider) { res.status(403).json({ error: "Not a provider" }); return; }

    const completed = await db.select().from(bookingsTable)
      .where(and(eq(bookingsTable.providerId, provider.id), eq(bookingsTable.status, "completed")));

    const total = completed.reduce((sum, b) => sum + parseFloat(String(b.amount)), 0);
    res.json({ totalEarnings: total, completedBookings: completed.length });
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

// GET /bookings/provider (provider dashboard) — must be before /:id
router.get("/provider", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.userId;
    const [provider] = await db.select().from(providersTable)
      .where(eq(providersTable.userId, userId)).limit(1);

    if (!provider && req.user!.role !== "admin" && req.user!.role !== "super_admin") {
      res.status(403).json({ error: "Not a provider" });
      return;
    }

    const rows = provider
      ? await db.select().from(bookingsTable)
        .where(eq(bookingsTable.providerId, provider.id))
        .orderBy(desc(bookingsTable.createdAt))
      : await db.select().from(bookingsTable).orderBy(desc(bookingsTable.createdAt));

    res.json({ provider, bookings: rows.map(fmtBooking) });
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

// GET /bookings/:id — dynamic route AFTER all static routes
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid booking ID" }); return; }

    const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id)).limit(1);
    if (!booking) { res.status(404).json({ error: "Not found" }); return; }

    const userId = req.user!.userId;
    const isOwner = booking.userId === userId;
    let isProvider = false;
    if (booking.providerId) {
      const [p] = await db.select().from(providersTable)
        .where(and(eq(providersTable.id, booking.providerId), eq(providersTable.userId, userId))).limit(1);
      isProvider = !!p;
    }
    const isAdmin = req.user!.role === "admin" || req.user!.role === "super_admin";
    if (!isOwner && !isProvider && !isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }

    const history = await db.select().from(bookingStatusHistoryTable)
      .where(eq(bookingStatusHistoryTable.bookingId, id))
      .orderBy(desc(bookingStatusHistoryTable.changedAt));

    let providerName = null;
    if (booking.providerId) {
      const [p] = await db.select().from(providersTable).where(eq(providersTable.id, booking.providerId)).limit(1);
      providerName = p?.name || null;
    }

    res.json({
      ...fmtBooking(booking),
      providerName,
      history: history.map(h => ({ ...h, changedAt: h.changedAt.toISOString() })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

// POST /bookings (create)
router.post("/", requireAuth, async (req, res) => {
  try {
    const { bookingType, providerId, amount, details } = req.body;
    if (!bookingType) { res.status(400).json({ error: "bookingType required" }); return; }

    const [booking] = await db.insert(bookingsTable).values({
      userId: req.user!.userId,
      providerId: providerId ? parseInt(providerId) : null,
      bookingType,
      status: "pending",
      paymentStatus: "unpaid",
      amount: String(amount || 0),
      details: details || null,
    }).returning();

    // Generate QR
    const qrCode = await generateQR(booking.id, bookingType);
    const [updated] = await db.update(bookingsTable)
      .set({ qrCode })
      .where(eq(bookingsTable.id, booking.id))
      .returning();

    // Record history
    await recordHistory(booking.id, null, "pending", req.user!.userId, "Booking created");

    const formatted = fmtBooking(updated);

    // Emit booking:created to booking owner for real-time update
    emitToUser(req.user!.userId, "booking:created", formatted);

    // Notify provider with booking:created event + persisted notification
    if (providerId) {
      const [provider] = await db.select().from(providersTable)
        .where(eq(providersTable.id, parseInt(providerId))).limit(1);
      if (provider) {
        const [bookingUser] = await db.select().from(usersTable)
          .where(eq(usersTable.id, req.user!.userId)).limit(1);

        // Real-time Socket.IO event to provider
        emitToUser(provider.userId, "booking:created", { ...formatted, userName: bookingUser?.name });

        // Persisted notification
        await notifyUser(
          provider.userId,
          `New ${bookingType} booking #${booking.id} from ${bookingUser?.name || "someone"}`,
          `/provider`,
          req.user!.userId
        );
      }
    }

    res.status(201).json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

// DELETE /bookings/:id (user cancels their own pending booking)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid booking ID" }); return; }

    const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id)).limit(1);
    if (!booking) { res.status(404).json({ error: "Not found" }); return; }
    if (booking.userId !== req.user!.userId) { res.status(403).json({ error: "Forbidden" }); return; }

    // Enforce: only pending bookings can be cancelled
    if (TERMINAL_STATES.has(booking.status)) {
      res.status(400).json({ error: `Cannot cancel a booking that is already ${booking.status}` });
      return;
    }
    if (!["pending"].includes(booking.status)) {
      res.status(400).json({ error: "Only pending bookings can be cancelled by users" });
      return;
    }

    const [updated] = await db.update(bookingsTable)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(bookingsTable.id, id))
      .returning();

    await recordHistory(id, booking.status, "cancelled", req.user!.userId, "Cancelled by user");

    const formatted = fmtBooking(updated);

    // Real-time event to the cancelling user
    emitToUser(req.user!.userId, "booking:updated", formatted);

    // Notify provider
    if (booking.providerId) {
      const [provider] = await db.select().from(providersTable)
        .where(eq(providersTable.id, booking.providerId)).limit(1);
      if (provider) {
        emitToUser(provider.userId, "booking:updated", formatted);
        await notifyUser(provider.userId, `Booking #${id} was cancelled by user`, "/provider");
      }
    }

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

// PATCH /bookings/:id/status (provider/admin changes status)
router.patch("/:id/status", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid booking ID" }); return; }

    const { status, note } = req.body;

    const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id)).limit(1);
    if (!booking) { res.status(404).json({ error: "Not found" }); return; }

    // Enforce terminal state protection
    if (TERMINAL_STATES.has(booking.status)) {
      res.status(400).json({ error: `Booking is already in terminal state: ${booking.status}` });
      return;
    }

    // Enforce valid transitions
    const allowedNext = VALID_TRANSITIONS[booking.status] ?? [];
    if (!allowedNext.includes(status)) {
      res.status(400).json({
        error: `Invalid transition: ${booking.status} → ${status}. Allowed: ${allowedNext.join(", ")}`,
      });
      return;
    }

    // Authorization: must be the provider or admin
    const userId = req.user!.userId;
    const isAdmin = req.user!.role === "admin" || req.user!.role === "super_admin";
    let isProvider = false;
    if (booking.providerId) {
      const [p] = await db.select().from(providersTable)
        .where(and(eq(providersTable.id, booking.providerId), eq(providersTable.userId, userId))).limit(1);
      isProvider = !!p;
    }
    if (!isProvider && !isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }

    const [updated] = await db.update(bookingsTable)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(bookingsTable.id, id))
      .returning();

    await recordHistory(id, booking.status, status, userId, note || null);

    const formatted = fmtBooking(updated);

    // Real-time booking:updated event to the booking owner
    emitToUser(booking.userId, "booking:updated", formatted);

    // Persisted notification to booking owner
    await notifyUser(
      booking.userId,
      `Your booking #${id} status changed to ${status}`,
      `/profile`,
      userId
    );

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
});

export default router;
