import express from "express";

import { dashboardRouter } from "./dashboard.js";
import { productsRouter } from './products.routes.js';
import { movementsRouter } from './movements.routes.js';

export const router = express.Router();

router.get("/health", (_, res) => res.send("OK"));
router.use(dashboardRouter);
router.use('/products', productsRouter);
router.use('/movements', movementsRouter);
