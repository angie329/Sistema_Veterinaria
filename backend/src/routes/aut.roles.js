import express from "express";
import { query } from "../config/database.js";
import { verifyJWT } from "../middleware/auth.js"; // ← USAR MIDDLEWARE COMPARTIDO

export const autRolesRouter = express.Router();

// Listar roles
autRolesRouter.get("/aut/roles", verifyJWT, async (_req, res) => {
  try {
    const rows = await query(`
      SELECT 
        r.id_aut_rol,
        r.aut_nombre_rol,
        r.aut_descripcion,
        r.aut_estado,
        (SELECT COUNT(*) FROM aut_rol_permiso WHERE id_aut_rol_fk = r.id_aut_rol) as permisos,
        (SELECT COUNT(*) FROM aut_usuario WHERE id_aut_rol_fk = r.id_aut_rol) as usuarios
      FROM aut_rol r 
      ORDER BY r.aut_nombre_rol
    `);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error listando roles" });
  }
});

// Obtener un rol por ID
autRolesRouter.get("/aut/roles/:id", verifyJWT, async (req, res) => {
  try {
    const [rol] = await query(
      `SELECT * FROM aut_rol WHERE id_aut_rol = ?`,
      [req.params.id]
    );
    
    if (!rol) {
      return res.status(404).json({ error: "Rol no encontrado" });
    }

    res.json(rol);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error obteniendo rol" });
  }
});

// Crear rol
autRolesRouter.post("/aut/roles", verifyJWT, async (req, res) => {
  try {
    const { nombre, descripcion, estado = "Activo" } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: "El nombre del rol es obligatorio" });
    }

    // Verificar que el nombre no exista
    const [existing] = await query(
      `SELECT id_aut_rol FROM aut_rol WHERE aut_nombre_rol = ?`,
      [nombre]
    );

    if (existing) {
      return res.status(400).json({ error: "Ya existe un rol con ese nombre" });
    }

    const result = await query(
      `INSERT INTO aut_rol (aut_modulo_origen, aut_nombre_rol, aut_descripcion, aut_estado)
       VALUES ((SELECT id_modulo_general_audit FROM ModuloGeneralAudit WHERE nombre_modulo='AUT'),
               ?, ?, ?)`,
      [nombre, descripcion, estado]
    );

    res.status(201).json({ id: result.insertId, message: "Rol creado correctamente" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error creando rol" });
  }
});

// Actualizar rol
autRolesRouter.put("/aut/roles/:id", verifyJWT, async (req, res) => {
  try {
    const { nombre, descripcion, estado } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: "El nombre del rol es obligatorio" });
    }

    // Verificar que el rol existe
    const [existing] = await query(
      `SELECT id_aut_rol FROM aut_rol WHERE id_aut_rol = ?`,
      [req.params.id]
    );

    if (!existing) {
      return res.status(404).json({ error: "Rol no encontrado" });
    }

    await query(
      `UPDATE aut_rol 
       SET aut_nombre_rol = ?, aut_descripcion = ?, aut_estado = ?
       WHERE id_aut_rol = ?`,
      [nombre, descripcion || null, estado || 'Activo', req.params.id]
    );

    res.json({ ok: true, message: "Rol actualizado correctamente" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error actualizando rol" });
  }
});

// Eliminar rol
autRolesRouter.delete("/aut/roles/:id", verifyJWT, async (req, res) => {
  try {
    // Verificar si hay usuarios con este rol
    const [usuarios] = await query(
      `SELECT COUNT(*) as count FROM aut_usuario WHERE id_aut_rol_fk = ?`,
      [req.params.id]
    );

    if (usuarios.count > 0) {
      return res.status(400).json({ 
        error: `No se puede eliminar el rol porque tiene ${usuarios.count} usuario(s) asignado(s)` 
      });
    }

    // Eliminar permisos asociados
    await query(
      `DELETE FROM aut_rol_permiso WHERE id_aut_rol_fk = ?`,
      [req.params.id]
    );

    // Eliminar rol
    await query(
      `DELETE FROM aut_rol WHERE id_aut_rol = ?`,
      [req.params.id]
    );

    res.json({ ok: true, message: "Rol eliminado correctamente" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error eliminando rol" });
  }
});