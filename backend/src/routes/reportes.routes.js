import express from "express";
import { getReporteVeterinarios } from "../controllers/reportes.controller.js";

const router = express.Router();

// GET /v1/reportes/veterinarios
router.get("/veterinarios", getReporteVeterinarios);

export default router;
