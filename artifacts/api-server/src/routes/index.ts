import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import schoolsRouter from "./schools";
import medicalRouter from "./medical";
import shopsRouter from "./shops";
import listingsRouter from "./listings";
import busesRouter from "./buses";
import jobsRouter from "./jobs";
import eventsRouter from "./events";
import noticesRouter from "./notices";
import emergencyRouter from "./emergency";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/schools", schoolsRouter);
router.use("/medical", medicalRouter);
router.use("/shops", shopsRouter);
router.use("/listings", listingsRouter);
router.use("/buses", busesRouter);
router.use("/jobs", jobsRouter);
router.use("/events", eventsRouter);
router.use("/notices", noticesRouter);
router.use("/emergency", emergencyRouter);
router.use("/stats", statsRouter);

export default router;
