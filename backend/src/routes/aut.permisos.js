import express from "express";
import jwt from "jsonwebtoken";
import { query } from "../config/database.js";

export const autPermisosRouter = express.Router();

const verifyJWT = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "falta token" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "token inválido" });
  }
};

// Listar permisos
autPermisosRouter.get("/aut/permisos", verifyJWT, async (_req, res) => {
  try {
    const rows = await query(`SELECT * FROM aut_permiso`);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "error listando permisos" });
  }
});

// (Opcional) Crear permiso
autPermisosRouter.post("/aut/permisos", verifyJWT, async (req, res) => {
  try {
    const {
      pantalla, vista, formulario,
      modulo_sistema, tipo_permiso, codigo_permiso,
      descripcion, estado = "Activo"
    } = req.body;

    const result = await query(
      `INSERT INTO aut_permiso
        (aut_modulo_origen, aut_pantalla, aut_vista, aut_formulario,
         aut_modulo_sistema, aut_tipo_permiso, aut_codigo_permiso,
         aut_descripcion, aut_estado)
       VALUES (
         (SELECT id_modulo_general_audit FROM ModuloGeneralAudit WHERE nombre_modulo='AUT'),
         ?, ?, ?, ?, ?, ?, ?, ?
       )`,
      [pantalla, vista, formulario, modulo_sistema, tipo_permiso, codigo_permiso, descripcion, estado]
    );

    res.status(201).json({ id: result.insertId });
  } catch (e) {
    res.status(500).json({ error: "error creando permiso" });
  }
});