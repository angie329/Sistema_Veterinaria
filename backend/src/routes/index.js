import express from "express";
<<<<<<< HEAD
import { dashboardRouter } from "./dashboard.js";
import { productsRouter } from './inventario/products.routes.js';
import { movementsRouter } from './inventario/movements.routes.js';
import { incomesRouter } from './inventario/incomes.routes.js';
import { salidasRouter } from './inventario/salidas.routes.js';
import { invExportsRouter } from "./inventario/invExports.routes.js";
import { estadoGeneralRouter } from "./estado-general.js";
import { provinciaRouter } from "./provincia.js";
import { ciudadRouter } from "./ciudad.js";
import { tipoDocumentoRouter } from "./tipo-documento.js";
import { generoSexoRouter } from "./genero-sexo.js";
import { operadoraRouter } from "./operadora.js";
import { estadoCivilRouter } from "./estado-civil.js";
=======

>>>>>>> 1c49789d2d96b35ab151b559ff9b250f278ecf93
import { ivaRouter } from "./iva.js";
import { ciudadRouter } from "./ciudad.js";
import { dashboardRouter } from "./dashboard.js";
import { provinciaRouter } from "./provincia.js";
import { operadoraRouter } from "./operadora.js";
import { generoSexoRouter } from "./genero-sexo.js";
import { metodoPagoRouter } from "./metodo-pago.js";
import { proveedoresRouter } from "./proveedores.js";
import { estadoCivilRouter } from "./estado-civil.js";
import { unidadMedidaRouter } from "./unidad-medida.js";
import { estadoGeneralRouter } from "./estado-general.js";
import { tipoDocumentoRouter } from "./tipo-documento.js";

import reporteRoutes from "./reportes.js";
import { turnosRouter } from "./turnos.js";
import { veterinariosRouter } from "./veterinarios.js";
import { especialidadesRouter } from "./especialidades.js";

import { petsRouter } from "./pets.js";

import clientsRoutes from "./clients.js";

export const router = express.Router();

router.get("/health", (_, res) => res.send("OK"));

router.use(dashboardRouter);
router.use("/iva", ivaRouter);
router.use("/ciudad", ciudadRouter);
router.use("/provincia", provinciaRouter);
router.use("/operadora", operadoraRouter);
router.use("/metodo-pago", metodoPagoRouter);
router.use("/genero-sexo", generoSexoRouter);
router.use("/proveedores", proveedoresRouter);
router.use("/estado-civil", estadoCivilRouter);
router.use("/unidad-medida", unidadMedidaRouter);
router.use("/tipo-documento", tipoDocumentoRouter);
router.use("/estado-general", estadoGeneralRouter);

router.use("/turnos", turnosRouter);
router.use("/reportes", reporteRoutes);
router.use("/veterinarios", veterinariosRouter);
router.use("/especialidades", especialidadesRouter);

router.use(petsRouter);

router.use("/api/clientes", clientsRoutes);
