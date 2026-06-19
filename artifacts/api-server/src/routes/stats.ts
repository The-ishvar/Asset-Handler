import { Router } from "express";
import { db } from "@workspace/db";
import {
  usersTable, schoolsTable, shopsTable, medicalStoresTable,
  listingsTable, jobsTable, eventsTable, noticesTable
} from "@workspace/db";
import { eq, count } from "drizzle-orm";

const router = Router();

async function getDashboardStats() {
  const today = new Date().toISOString().split("T")[0];
  const [users] = await db.select({ count: count() }).from(usersTable);
  const [schools] = await db.select({ count: count() }).from(schoolsTable);
  const [shops] = await db.select({ count: count() }).from(shopsTable);
  const [medical] = await db.select({ count: count() }).from(medicalStoresTable);
  const [totalListings] = await db.select({ count: count() }).from(listingsTable);
  const [pendingListings] = await db.select({ count: count() }).from(listingsTable).where(eq(listingsTable.status, "pending"));
  const [jobs] = await db.select({ count: count() }).from(jobsTable);
  const allEvents = await db.select({ date: eventsTable.date }).from(eventsTable);
  const upcoming = allEvents.filter((e) => e.date >= today).length;
  const [notices] = await db.select({ count: count() }).from(noticesTable);

  return {
    totalUsers: users.count,
    totalSchools: schools.count,
    totalShops: shops.count,
    totalMedical: medical.count,
    totalListings: totalListings.count,
    pendingListings: pendingListings.count,
    totalJobs: jobs.count,
    upcomingEvents: upcoming,
    activeNotices: notices.count,
  };
}

async function getRecentActivity() {
  const listings = await db.select().from(listingsTable).orderBy(listingsTable.createdAt).limit(5);
  const events = await db.select().from(eventsTable).orderBy(eventsTable.createdAt).limit(3);
  const notices = await db.select().from(noticesTable).orderBy(noticesTable.createdAt).limit(3);

  const activity = [
    ...listings.map((l) => ({
      id: l.id,
      type: "listing",
      title: l.title,
      content: `${l.status} — ₹${parseFloat(l.price as string).toLocaleString("en-IN")}`,
      createdAt: l.createdAt.toISOString(),
    })),
    ...events.map((e) => ({
      id: e.id,
      type: "event",
      title: e.title,
      content: e.date,
      createdAt: e.createdAt.toISOString(),
    })),
    ...notices.map((n) => ({
      id: n.id,
      type: "notice",
      title: n.title,
      content: (n as any).priority ?? "Notice",
      createdAt: n.createdAt.toISOString(),
    })),
  ]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 10);

  return activity;
}

// Primary paths used by frontend: GET /stats and GET /stats/activity
router.get("/", async (req, res) => {
  res.json(await getDashboardStats());
});

router.get("/activity", async (req, res) => {
  res.json(await getRecentActivity());
});

// Legacy paths for backward compatibility
router.get("/dashboard", async (req, res) => {
  res.json(await getDashboardStats());
});

router.get("/recent-activity", async (req, res) => {
  res.json(await getRecentActivity());
});

export default router;
