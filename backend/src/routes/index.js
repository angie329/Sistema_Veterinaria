import express from "express";

import { dashboardRouter } from "./dashboard.js";
import { billingRouter } from "./billing.js";

export const router = express.Router();

router.get("/health", (_, res) => res.send("OK"));
router.use(dashboardRouter);
router.use("/billing", billingRouter);