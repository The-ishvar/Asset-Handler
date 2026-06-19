import { Router } from "express";
import { db } from "@workspace/db";
import { busesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

function fmt(s: typeof busesTable.$inferSelect) {
  return {
    id: s.id,
    name: s.name,
    route: s.route,
    timing: s.departureTime,
    from: null,
    to: null,
    description: s.arrivalTime ? `Arrives: ${s.arrivalTime}` : null,
    departureTime: s.departureTime,
    arrivalTime: s.arrivalTime,
    fare: s.fare,
    createdAt: s.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const rows = await db.select().from(busesTable).orderBy(busesTable.departureTime);
  res.json(rows.map(fmt));
});

router.post("/", requireAdmin, async (req, res) => {
  const { name, route, from, to, timing, departureTime, arrivalTime, description, fare } = req.body;
  if (!route) { res.status(400).json({ error: "route required" }); return; }
  const resolvedRoute = route;
  const resolvedName = name || route;
  const resolvedDepartureTime = timing || departureTime || "";
  const resolvedArrival = arrivalTime || (to ? `To: ${to}` : null);
  const [row] = await db.insert(busesTable).values({
    name: resolvedName,
    route: resolvedRoute,
    departureTime: resolvedDepartureTime,
    arrivalTime: resolvedArrival,
    fare: fare || "—",
  }).returning();
  res.status(201).json(fmt(row));
});

router.patch("/:id", requireAdmin, async (req, res) => {
  const { name, route, timing, departureTime, arrivalTime, fare } = req.body;
  const updates: Partial<typeof busesTable.$inferInsert> = {};
  if (name !== undefined) updates.name = name;
  if (route !== undefined) updates.route = route;
  if (timing !== undefined || departureTime !== undefined) updates.departureTime = timing ?? departureTime;
  if (arrivalTime !== undefined) updates.arrivalTime = arrivalTime;
  if (fare !== undefined) updates.fare = fare;
  const [row] = await db.update(busesTable).set(updates).where(eq(busesTable.id, parseInt(req.params.id as string))).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(fmt(row));
});

router.delete("/:id", requireAdmin, async (req, res) => {
  await db.delete(busesTable).where(eq(busesTable.id, parseInt(req.params.id as string)));
  res.status(204).end();
});

export default router;
