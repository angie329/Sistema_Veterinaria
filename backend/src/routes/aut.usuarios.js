import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/database.js";

export const autUsuariosRouter = express.Router();

// Middleware local
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

// Listar usuarios
autUsuariosRouter.get("/aut/usuarios", verifyJWT, async (_req, res) => {
  try {
    const rows = await query(
      `SELECT u.id_aut_usuario, u.aut_nombre_usuario, u.aut_email, u.aut_telefono,
              u.aut_estado, u.aut_ultimo_acceso, r.aut_nombre_rol AS rol
         FROM aut_usuario u
         JOIN aut_rol r ON r.id_aut_rol = u.id_aut_rol_fk`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "error listando usuarios" });
  }
});

// Crear usuario
autUsuariosRouter.post("/aut/usuarios", verifyJWT, async (req, res) => {
  try {
    const { username, password, email, telefono, rolId } = req.body;
    const hash = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO aut_usuario
         (aut_modulo_origen, aut_nombre_usuario, aut_contrasena, id_aut_rol_fk,
          aut_email, aut_telefono)
       VALUES (
         (SELECT id_modulo_general_audit FROM ModuloGeneralAudit WHERE nombre_modulo='AUT'),
         ?, ?, ?, ?, ?
       )`,
      [username, hash, rolId, email, telefono]
    );

    res.status(201).json({ id: result.insertId });
  } catch (e) {
    res.status(500).json({ error: "error creando usuario" });
  }
});

// Editar usuario
autUsuariosRouter.put("/aut/usuarios/:id", verifyJWT, async (req, res) => {
  try {
    const { email, telefono, estado, rolId } = req.body;
    await query(
      `UPDATE aut_usuario
          SET aut_email = ?, aut_telefono = ?, aut_estado = ?, id_aut_rol_fk = ?
        WHERE id_aut_usuario = ?`,
      [email, telefono, estado, rolId, req.params.id]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "error actualizando usuario" });
  }
});

// Eliminar usuario
autUsuariosRouter.delete("/aut/usuarios/:id", verifyJWT, async (req, res) => {
  try {
    await query(`DELETE FROM aut_usuario WHERE id_aut_usuario = ?`, [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "error eliminando usuario" });
  }
});