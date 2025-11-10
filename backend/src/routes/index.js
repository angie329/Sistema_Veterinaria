import express from "express";

import { dashboardRouter } from "./dashboard.js";
import { autAuthRouter } from "./aut.auth.js";
import { autUsuariosRouter } from "./aut.usuarios.js";
import { autRolesRouter } from "./aut.roles.js";
import { autPermisosRouter } from "./aut.permisos.js";
import { autReportesRouter } from "./aut.reportes.js";
import { autRolesPermisosRouter } from "./aut.roles-permisos.js";

export const router = express.Router();

router.get("/health", (_, res) => res.send("OK"));
router.use(dashboardRouter);
router.use(autAuthRouter);
router.use(autUsuariosRouter);
router.use(autRolesRouter);
router.use(autPermisosRouter);
router.use(autReportesRouter);
router.use(autRolesPermisosRouter);