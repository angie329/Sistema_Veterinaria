import express from "express";
import { getDashboard } from "../controllers/dashboard.controller.js";

export const dashboardRouter = express.Router();

dashboardRouter.get("/dashboard", getDashboard);
