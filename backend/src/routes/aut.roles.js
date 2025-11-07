import express from "express";
import jwt from "jsonwebtoken";
import { query } from "../config/database.js";

export const autRolesRouter = express.Router();

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

// Listar roles
autRolesRouter.get("/aut/roles", verifyJWT, async (_req, res) => {
  try {
    const rows = await query(`SELECT * FROM aut_rol`);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "error listando roles" });
  }
});

// (Opcionales)
autRolesRouter.post("/aut/roles", verifyJWT, async (req, res) => {
  try {
    const { nombre, descripcion, estado = "Activo" } = req.body;
    const result = await query(
      `INSERT INTO aut_rol (aut_modulo_origen, aut_nombre_rol, aut_descripcion, aut_estado)
       VALUES ((SELECT id_modulo_general_audit FROM ModuloGeneralAudit WHERE nombre_modulo='AUT'),
               ?, ?, ?)`,
      [nombre, descripcion, estado]
    );
    res.status(201).json({ id: result.insertId });
  } catch (e) {
    res.status(500).json({ error: "error creando rol" });
  }
});