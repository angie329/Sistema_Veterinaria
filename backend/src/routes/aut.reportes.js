import express from "express";
import jwt from "jsonwebtoken";
import { query } from "../config/database.js";

export const autReportesRouter = express.Router();

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

autReportesRouter.get("/aut/report/usuarios-por-rol", verifyJWT, async (_req, res) => {
  try {
    const rows = await query(`
      SELECT r.aut_nombre_rol AS rol,
             u.aut_nombre_usuario AS usuario,
             u.aut_email AS email,
             u.aut_estado AS estado,
             u.aut_ultimo_acceso AS ultimo_acceso
        FROM aut_usuario u
        JOIN aut_rol r ON r.id_aut_rol = u.id_aut_rol_fk
       ORDER BY r.aut_nombre_rol, u.aut_nombre_usuario
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "error generando reporte" });
  }
});