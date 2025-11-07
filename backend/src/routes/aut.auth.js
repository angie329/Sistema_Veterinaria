import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/database.js";

export const autAuthRouter = express.Router();

autAuthRouter.post("/aut/login", async (req, res) => {
  try {
    const usernameIn = (req.body?.username ?? "").trim();
    const password = req.body?.password ?? "";

    // Buscar usuario (traemos el hash solo para comparar)
    const [user] = await query(
      `SELECT u.id_aut_usuario   AS id,
              u.aut_nombre_usuario AS username,
              u.aut_contrasena     AS hash,
              u.aut_estado         AS estado,
              r.id_aut_rol         AS roleId,
              r.aut_nombre_rol     AS roleName
         FROM aut_usuario u
         JOIN aut_rol r ON r.id_aut_rol = u.id_aut_rol_fk
        WHERE u.aut_nombre_usuario = ? LIMIT 1`,
      [usernameIn]
    );

    if (!user) return res.status(401).json({ error: "usuario/clave incorrectos" });
    if (user.estado !== "Activo") return res.status(403).json({ error: "usuario inactivo" });

    const ok = await bcrypt.compare(password, user.hash);
    if (!ok) return res.status(401).json({ error: "usuario/clave incorrectos" });

    await query(
      `UPDATE aut_usuario SET aut_ultimo_acceso = NOW() WHERE id_aut_usuario = ?`,
      [user.id]
    );

    if (!process.env.JWT_SECRET) {
      // Defensa por si el .env no cargó
      throw new Error("JWT_SECRET_NOT_SET");
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, roleId: user.roleId, roleName: user.roleName },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "8h" }
    );

    const userSafe = {
      id: user.id,
      username: user.username,
      estado: user.estado,
      roleId: user.roleId,
      roleName: user.roleName,
    };

    res.json({ token, user: userSafe });
  } catch (e) {
    console.error(e);
    // En producción evita exponer detalles
    res.status(500).json({ error: "error interno" });
  }
});