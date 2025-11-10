import express from "express";
import { query } from "../config/database.js";
import { verifyJWT } from "../middleware/auth.js";

export const autRolesPermisosRouter = express.Router();

/**
 * Obtener permisos asignados a un rol específico
 * GET /aut/roles/:id/permisos
 */
autRolesPermisosRouter.get("/aut/roles/:id/permisos", verifyJWT, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el rol existe
    const [rol] = await query(
      `SELECT id_aut_rol, aut_nombre_rol FROM aut_rol WHERE id_aut_rol = ?`,
      [id]
    );

    if (!rol) {
      return res.status(404).json({ error: "Rol no encontrado" });
    }

    // Obtener permisos asignados al rol
    const permisos = await query(
      `SELECT 
        p.id_aut_permiso,
        p.aut_pantalla,
        p.aut_vista,
        p.aut_formulario,
        p.aut_modulo_sistema,
        p.aut_tipo_permiso,
        p.aut_codigo_permiso,
        p.aut_descripcion
      FROM aut_permiso p
      INNER JOIN aut_rol_permiso rp ON rp.id_aut_permiso_fk = p.id_aut_permiso
      WHERE rp.id_aut_rol_fk = ?
      ORDER BY p.aut_modulo_sistema, p.aut_pantalla`,
      [id]
    );

    res.json({
      rol: rol.aut_nombre_rol,
      permisos
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener permisos del rol" });
  }
});

/**
 * Asignar permisos a un rol (reemplaza todos los permisos existentes)
 * POST /aut/roles/:id/permisos
 * Body: { permisoIds: [1, 2, 3, ...] }
 */
autRolesPermisosRouter.post("/aut/roles/:id/permisos", verifyJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const { permisoIds } = req.body;

    if (!Array.isArray(permisoIds)) {
      return res.status(400).json({ error: "permisoIds debe ser un array" });
    }

    // Verificar que el rol existe
    const [rol] = await query(
      `SELECT id_aut_rol FROM aut_rol WHERE id_aut_rol = ?`,
      [id]
    );

    if (!rol) {
      return res.status(404).json({ error: "Rol no encontrado" });
    }

    // Eliminar permisos existentes
    await query(
      `DELETE FROM aut_rol_permiso WHERE id_aut_rol_fk = ?`,
      [id]
    );

    // Insertar nuevos permisos (si hay alguno)
    if (permisoIds.length > 0) {
      const [modulo] = await query(
        `SELECT id_modulo_general_audit FROM ModuloGeneralAudit WHERE nombre_modulo='AUT'`
      );

      if (!modulo) {
        return res.status(500).json({ error: "Módulo AUT no encontrado" });
      }

      const moduloId = modulo.id_modulo_general_audit;
      const values = permisoIds.map(permisoId => [moduloId, id, permisoId]);
      const placeholders = values.map(() => "(?, ?, ?)").join(", ");
      const flatValues = values.flat();

      await query(
        `INSERT INTO aut_rol_permiso (aut_modulo_origen, id_aut_rol_fk, id_aut_permiso_fk) VALUES ${placeholders}`,
        flatValues
      );
    }

    res.json({ 
      ok: true, 
      message: "Permisos asignados correctamente",
      count: permisoIds.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al asignar permisos" });
  }
});

/**
 * Agregar un permiso específico a un rol (sin eliminar los existentes)
 * PUT /aut/roles/:id/permisos/:permisoId
 */
autRolesPermisosRouter.put("/aut/roles/:id/permisos/:permisoId", verifyJWT, async (req, res) => {
  try {
    const { id, permisoId } = req.params;

    // Verificar que no exista ya la relación
    const [existing] = await query(
      `SELECT * FROM aut_rol_permiso WHERE id_aut_rol_fk = ? AND id_aut_permiso_fk = ?`,
      [id, permisoId]
    );

    if (existing) {
      return res.status(400).json({ error: "El permiso ya está asignado al rol" });
    }

    // Insertar la relación
    const [modulo] = await query(
      `SELECT id_modulo_general_audit FROM ModuloGeneralAudit WHERE nombre_modulo='AUT'`
    );

    await query(
      `INSERT INTO aut_rol_permiso (aut_modulo_origen, id_aut_rol_fk, id_aut_permiso_fk) VALUES (?, ?, ?)`,
      [modulo.id_modulo_general_audit, id, permisoId]
    );

    res.json({ ok: true, message: "Permiso agregado al rol" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al agregar permiso" });
  }
});

/**
 * Remover un permiso específico de un rol
 * DELETE /aut/roles/:id/permisos/:permisoId
 */
autRolesPermisosRouter.delete("/aut/roles/:id/permisos/:permisoId", verifyJWT, async (req, res) => {
  try {
    const { id, permisoId } = req.params;

    const result = await query(
      `DELETE FROM aut_rol_permiso WHERE id_aut_rol_fk = ? AND id_aut_permiso_fk = ?`,
      [id, permisoId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Relación no encontrada" });
    }

    res.json({ ok: true, message: "Permiso removido del rol" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al remover permiso" });
  }
});

/**
 * Obtener todos los permisos disponibles (para checkboxes)
 * GET /aut/permisos/disponibles
 */
autRolesPermisosRouter.get("/aut/permisos/disponibles", verifyJWT, async (req, res) => {
  try {
    const permisos = await query(
      `SELECT 
        id_aut_permiso,
        aut_pantalla,
        aut_vista,
        aut_formulario,
        aut_modulo_sistema,
        aut_tipo_permiso,
        aut_codigo_permiso,
        aut_descripcion,
        aut_estado
      FROM aut_permiso
      WHERE aut_estado = 'Activo'
      ORDER BY aut_modulo_sistema, aut_pantalla, aut_tipo_permiso`
    );

    res.json(permisos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener permisos" });
  }
});