import { Router } from "express";
import { db } from "@workspace/db";
import { jobApplicationsTable, jobsTable, usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// Apply to a job
router.post("/jobs/:id/apply", requireAuth, async (req: any, res) => {
  try {
    const jobId = Number(req.params.id);
    const { applicantName, applicantPhone, message } = req.body;
    if (!applicantName || !applicantPhone) {
      return res.status(400).json({ error: "Name and phone are required" });
    }
    const [app] = await db.insert(jobApplicationsTable).values({
      jobId,
      userId: req.user.id,
      applicantName,
      applicantPhone,
      message: message || null,
    }).returning();
    res.json(app);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get applications for a job (admin only)
router.get("/jobs/:id/applications", requireAuth, async (req: any, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const jobId = Number(req.params.id);
    const apps = await db.select().from(jobApplicationsTable)
      .where(eq(jobApplicationsTable.jobId, jobId))
      .orderBy(jobApplicationsTable.createdAt);
    res.json(apps);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Check if user already applied
router.get("/jobs/:id/applied", requireAuth, async (req: any, res) => {
  try {
    const jobId = Number(req.params.id);
    const [app] = await db.select().from(jobApplicationsTable)
      .where(eq(jobApplicationsTable.jobId, jobId))
      .limit(1);
    // Check if this user applied
    const allApps = await db.select().from(jobApplicationsTable)
      .where(eq(jobApplicationsTable.jobId, jobId));
    const userApp = allApps.find((a) => a.userId === req.user.id);
    res.json({ applied: !!userApp });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
