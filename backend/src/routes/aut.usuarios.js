import express from "express";
import bcrypt from "bcryptjs";
import { query } from "../config/database.js";
import { verifyJWT } from "../middleware/auth.js"; // ← USAR MIDDLEWARE COMPARTIDO

export const autUsuariosRouter = express.Router();

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
    console.error(e);
    res.status(500).json({ error: "Error listando usuarios" });
  }
});

// Crear usuario
autUsuariosRouter.post("/aut/usuarios", verifyJWT, async (req, res) => {
  try {
    const { username, password, email, telefono, rolId } = req.body;

    // Validaciones básicas
    if (!username || !password || !rolId) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    // Verificar que el username no exista
    const [existing] = await query(
      `SELECT id_aut_usuario FROM aut_usuario WHERE aut_nombre_usuario = ?`,
      [username]
    );

    if (existing) {
      return res.status(400).json({ error: "El nombre de usuario ya existe" });
    }

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

    res.status(201).json({ id: result.insertId, message: "Usuario creado correctamente" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error creando usuario" });
  }
});

// Editar usuario
autUsuariosRouter.put("/aut/usuarios/:id", verifyJWT, async (req, res) => {
  try {
    const { email, telefono, estado, rolId, password } = req.body;

    // Construir query dinámico según los campos enviados
    let updateQuery = `UPDATE aut_usuario SET aut_email = ?, aut_telefono = ?, aut_estado = ?, id_aut_rol_fk = ?`;
    let params = [email, telefono, estado, rolId];

    // Si se envió contraseña, hashearla y agregarla
    if (password && password.length >= 6) {
      const hash = await bcrypt.hash(password, 10);
      updateQuery += `, aut_contrasena = ?`;
      params.push(hash);
    }

    updateQuery += ` WHERE id_aut_usuario = ?`;
    params.push(req.params.id);

    await query(updateQuery, params);
    res.json({ ok: true, message: "Usuario actualizado correctamente" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error actualizando usuario" });
  }
});

// Eliminar usuario
autUsuariosRouter.delete("/aut/usuarios/:id", verifyJWT, async (req, res) => {
  try {
    // Verificar que no se esté eliminando a sí mismo
    if (req.user.id == req.params.id) {
      return res.status(400).json({ error: "No puedes eliminar tu propio usuario" });
    }

    await query(`DELETE FROM aut_usuario WHERE id_aut_usuario = ?`, [req.params.id]);
    res.json({ ok: true, message: "Usuario eliminado correctamente" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error eliminando usuario" });
  }
});