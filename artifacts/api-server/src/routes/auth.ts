import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, signToken } from "../middlewares/auth";

// ── In-memory OTP store (phone → {otp, expiresAt}) ──────────────────────────
const otpStore = new Map<string, { otp: string; expiresAt: number }>();
function generateOtp() { return String(Math.floor(100000 + Math.random() * 900000)); }
function getOtp(phone: string) { return otpStore.get(phone); }
function setOtp(phone: string, otp: string) { otpStore.set(phone, { otp, expiresAt: Date.now() + 10 * 60 * 1000 }); }
function clearOtp(phone: string) { otpStore.delete(phone); }

const router = Router();

const SUPER_ADMIN_PHONE = process.env.SUPER_ADMIN_PHONE || "9660585691";
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || "9660585691ms";

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email ?? null,
    phone: user.phone ?? null,
    avatarUrl: user.avatarUrl ?? null,
    bio: (user as any).bio ?? null,
    coverUrl: (user as any).coverUrl ?? null,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
}

router.post("/register", async (req, res) => {
  const { name, phone, password, village, bio } = req.body;
  if (!name || !phone || !password) {
    res.status(400).json({ error: "name, phone, and password are required" });
    return;
  }
  const existing = await db.select().from(usersTable).where(eq(usersTable.phone, phone)).limit(1);
  if (existing.length > 0) {
    res.status(400).json({ error: "Phone number already registered" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({
    name,
    phone,
    email: null,
    passwordHash,
    role: "user",
  } as any).returning();
  const token = signToken(user.id, user.role);
  res.status(201).json({ token, user: formatUser(user) });
});

router.post("/login", async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    res.status(400).json({ error: "phone and password are required" });
    return;
  }

  // Super Admin shortcut
  if (phone === SUPER_ADMIN_PHONE && password === SUPER_ADMIN_PASSWORD) {
    // Find or create super admin user
    let [superAdmin] = await db.select().from(usersTable).where(eq(usersTable.phone, SUPER_ADMIN_PHONE)).limit(1);
    if (!superAdmin) {
      const hash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);
      [superAdmin] = await db.insert(usersTable).values({
        name: "Super Admin",
        phone: SUPER_ADMIN_PHONE,
        email: null,
        passwordHash: hash,
        role: "super_admin",
      } as any).returning();
    } else if (superAdmin.role !== "super_admin") {
      // Upgrade existing user to super admin
      [superAdmin] = await db.update(usersTable).set({ role: "super_admin" } as any).where(eq(usersTable.id, superAdmin.id)).returning();
    }
    const token = signToken(superAdmin.id, superAdmin.role);
    return res.json({ token, user: formatUser(superAdmin) });
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.phone, phone)).limit(1);
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = signToken(user.id, user.role);
  res.json({ token, user: formatUser(user) });
});

router.get("/me", requireAuth, async (req, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId)).limit(1);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(formatUser(user));
});

// POST /auth/forgot-password — sends OTP (returns OTP in dev for testing)
router.post("/forgot-password", async (req, res) => {
  const { phone } = req.body;
  if (!phone) { res.status(400).json({ error: "phone required" }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.phone, String(phone))).limit(1);
  if (!user) { res.status(404).json({ error: "Phone number not registered" }); return; }
  const otp = generateOtp();
  setOtp(String(phone), otp);
  // In production this would send via SMS. For dev, return OTP in response.
  res.json({ success: true, message: "OTP sent to your phone", otp, dev: true });
});

// POST /auth/verify-otp — checks OTP without resetting password
router.post("/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) { res.status(400).json({ error: "phone and otp required" }); return; }
  const stored = getOtp(String(phone));
  if (!stored) { res.status(400).json({ error: "OTP expired or not requested" }); return; }
  if (Date.now() > stored.expiresAt) { clearOtp(String(phone)); res.status(400).json({ error: "OTP expired. Please request a new one." }); return; }
  if (stored.otp !== String(otp)) { res.status(400).json({ error: "Invalid OTP" }); return; }
  res.json({ success: true, message: "OTP verified" });
});

// POST /auth/reset-password — verifies OTP then resets password
router.post("/reset-password", async (req, res) => {
  const { phone, otp, newPassword } = req.body;
  if (!phone || !otp || !newPassword) { res.status(400).json({ error: "phone, otp, and newPassword required" }); return; }
  if (newPassword.length < 6) { res.status(400).json({ error: "Password must be at least 6 characters" }); return; }
  const stored = getOtp(String(phone));
  if (!stored) { res.status(400).json({ error: "OTP expired or not requested" }); return; }
  if (Date.now() > stored.expiresAt) { clearOtp(String(phone)); res.status(400).json({ error: "OTP expired. Please request a new one." }); return; }
  if (stored.otp !== String(otp)) { res.status(400).json({ error: "Invalid OTP" }); return; }
  const passwordHash = await bcrypt.hash(newPassword, 10);
  const [user] = await db.update(usersTable).set({ passwordHash } as any).where(eq(usersTable.phone, String(phone))).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  clearOtp(String(phone));
  res.json({ success: true, message: "Password reset successfully" });
});

// POST /auth/change-password — change password for logged-in user
router.post("/change-password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) { res.status(400).json({ error: "currentPassword and newPassword required" }); return; }
  if (newPassword.length < 6) { res.status(400).json({ error: "New password must be at least 6 characters" }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId)).limit(1);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) { res.status(401).json({ error: "Current password is incorrect" }); return; }
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.update(usersTable).set({ passwordHash } as any).where(eq(usersTable.id, user.id));
  res.json({ success: true, message: "Password changed successfully" });
});

export default router;
