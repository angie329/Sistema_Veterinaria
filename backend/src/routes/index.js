import express from "express";

import { dashboardRouter } from "./dashboard.js";
import { appointmentsRouter } from "./appointments.js";

export const router = express.Router();

router.get("/health", (_, res) => res.send("OK"));
router.use("/dashboard", dashboardRouter);
router.use("/appointments", appointmentsRouter);
