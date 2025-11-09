import express from "express";
import { dashboardRouter } from "./dashboard.js";
import clientsRoutes from "./clients.js";


export const router = express.Router();

router.get("/health", (_, res) => res.send("OK"));
router.use("/api/clientes", clientsRoutes);
router.use(dashboardRouter);