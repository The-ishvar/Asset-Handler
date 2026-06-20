import { Router } from "express";
import { db } from "@workspace/db";
import { featureFlagsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router = Router();

export const DEFAULT_FEATURES: Record<string, boolean> = {
  posts: true,
  shops: true,
  autoBooking: true,
  busBooking: true,
  medical: true,
  schools: true,
  reels: true,
  stories: true,
  marketplace: true,
  map: true,
  emergency: true,
  jobs: false,
  events: false,
  notices: false,
  snaps: false,
  messages: false,
  notifications: false,
  bookEvent: false,
  about: false,
  provider: false,
};

async function ensureDefaultsExist() {
  const existing = await db.select().from(featureFlagsTable);
  const existingKeys = new Set(existing.map((f) => f.key));
  const missing = Object.entries(DEFAULT_FEATURES).filter(([key]) => !existingKeys.has(key));
  if (missing.length > 0) {
    await db.insert(featureFlagsTable).values(
      missing.map(([key, enabled]) => ({ key, enabled }))
    );
  }
}

async function getAllFlags(): Promise<Record<string, boolean>> {
  const flags = await db.select().from(featureFlagsTable);
  const result: Record<string, boolean> = { ...DEFAULT_FEATURES };
  for (const flag of flags) {
    result[flag.key] = flag.enabled;
  }
  return result;
}

router.get("/features", async (_req, res) => {
  try {
    await ensureDefaultsExist();
    const result = await getAllFlags();
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to fetch features" });
  }
});

router.patch("/features", requireAuth, async (req, res) => {
  if (req.user?.role !== "super_admin") {
    res.status(403).json({ error: "Only Super Admin can manage features" });
    return;
  }

  try {
    const updates = req.body as Record<string, boolean>;

    for (const [key, enabled] of Object.entries(updates)) {
      if (typeof enabled !== "boolean") continue;
      await db
        .insert(featureFlagsTable)
        .values({ key, enabled, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: featureFlagsTable.key,
          set: { enabled, updatedAt: new Date() },
        });
    }

    const result = await getAllFlags();
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to update features" });
  }
});

export default router;
