import express from "express";
import { query } from "../config/database.js";
import { verifyJWT } from "../middleware/auth.js"; // ← USAR MIDDLEWARE COMPARTIDO

export const autPermisosRouter = express.Router();

// Listar permisos
autPermisosRouter.get("/aut/permisos", verifyJWT, async (_req, res) => {
  try {
    const rows = await query(`
      SELECT 
        p.id_aut_permiso,
        p.aut_pantalla,
        p.aut_descripcion,
        p.aut_codigo_permiso,
        p.aut_modulo_sistema,
        p.aut_tipo_permiso,
        (SELECT COUNT(*) FROM aut_rol_permiso WHERE id_aut_permiso_fk = p.id_aut_permiso) as roles_asignados
      FROM aut_permiso p
      ORDER BY p.aut_modulo_sistema, p.aut_pantalla
    `);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error listando permisos" });
  }
});

// Crear permiso
autPermisosRouter.post("/aut/permisos", verifyJWT, async (req, res) => {
  try {
    const {
      pantalla, vista, formulario,
      modulo_sistema, tipo_permiso, codigo_permiso,
      descripcion, estado = "Activo"
    } = req.body;

    if (!pantalla || !modulo_sistema || !tipo_permiso) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

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

    res.status(201).json({ id: result.insertId, message: "Permiso creado correctamente" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error creando permiso" });
  }
});

// Actualizar permiso
autPermisosRouter.put("/aut/permisos/:id", verifyJWT, async (req, res) => {
  try {
    const {
      pantalla, vista, formulario,
      modulo_sistema, tipo_permiso, codigo_permiso,
      descripcion, estado
    } = req.body;

    await query(
      `UPDATE aut_permiso
       SET aut_pantalla = ?, aut_vista = ?, aut_formulario = ?,
           aut_modulo_sistema = ?, aut_tipo_permiso = ?, aut_codigo_permiso = ?,
           aut_descripcion = ?, aut_estado = ?
       WHERE id_aut_permiso = ?`,
      [pantalla, vista, formulario, modulo_sistema, tipo_permiso, codigo_permiso, descripcion, estado, req.params.id]
    );

    res.json({ ok: true, message: "Permiso actualizado correctamente" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error actualizando permiso" });
  }
});

// Eliminar permiso
autPermisosRouter.delete("/aut/permisos/:id", verifyJWT, async (req, res) => {
  try {
    // Eliminar relaciones con roles
    await query(
      `DELETE FROM aut_rol_permiso WHERE id_aut_permiso_fk = ?`,
      [req.params.id]
    );

    // Eliminar permiso
    await query(
      `DELETE FROM aut_permiso WHERE id_aut_permiso = ?`,
      [req.params.id]
    );

    res.json({ ok: true, message: "Permiso eliminado correctamente" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error eliminando permiso" });
  }
});