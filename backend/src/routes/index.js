import express from "express";

import { dashboardRouter } from "./dashboard.js";

export const router = express.Router();

router.get("/health", (_, res) => res.send("OK"));
router.use(dashboardRouter);
