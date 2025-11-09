import express from "express";

import { dashboardRouter } from "./dashboard.js";
import { productsRouter } from './products.routes.js';
import { movementsRouter } from './movements.routes.js';
import { incomesRouter } from './incomes.routes.js';
import { salidasRouter } from './salidas.routes.js';
import { invExportsRouter } from "./invExports.routes.js";
export const router = express.Router();

router.get("/health", (_, res) => res.send("OK"));
router.use(dashboardRouter);
router.use('/products', productsRouter);
router.use('/movements', movementsRouter);
router.use('/incomes', incomesRouter);
router.use('/salidas', salidasRouter);
router.use('/invexports', invExportsRouter);
