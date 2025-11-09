// ==========================================================
// pets.routes.js
// ----------------------------------------------------------
// Archivo de rutas para la gestión de mascotas en el sistema.
// Define los endpoints REST para listar, crear, actualizar,
// eliminar y obtener detalles de mascotas, así como sus
// clasificaciones, tipos, razas y géneros.
// ==========================================================

import express from "express";
import { query } from "../config/database.js";

export const petsRouter = express.Router();

/* ==========================================================
   GET /v1/pets
   ----------------------------------------------------------
   Obtiene la lista completa de mascotas registradas.
   Incluye tipo, raza, género y estado.
========================================================== */
petsRouter.get("/pets", async (req, res) => {
  try {
    const sql = `
      SELECT 
        m.mas_id_mascota AS id_mascota,
        m.mas_nombre AS nombre_mascota,
        t.mas_descripcion AS tipo_mascota,
        r.mas_descripcion AS raza,
        g.gen_nombre AS genero,
        m.mas_fecha_nacimiento,
        m.mas_estado,
        m.mas_observaciones
      FROM mas_mascota m
      INNER JOIN mas_tipo_mascota t 
        ON m.mas_id_tipo_mascota_fk = t.mas_id_tipo_mascota
      INNER JOIN mas_raza r 
        ON m.mas_id_raza_fk = r.mas_id_raza
      INNER JOIN gen_generosexo g 
        ON m.mas_id_genero_sexo_fk = g.gen_id_genero_sexo
      ORDER BY id_mascota;
    `;

    const rows = await query(sql);

    // Respuesta JSON estándar
    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error al obtener mascotas:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener los datos de las mascotas",
    });
  }
});

/* ==========================================================
   GET /v1/pets/:id/details
   ----------------------------------------------------------
   Devuelve detalles básicos de una mascota específica:
   nombre y observaciones.
========================================================== */
petsRouter.get("/pets/:id/details", async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        m.mas_nombre AS nombre_mascota,
        m.mas_observaciones AS observaciones
      FROM mas_mascota m
      WHERE m.mas_id_mascota = ?;
    `;

    const result = await query(sql, [id]);

    if (result.length === 0) {
      return res.json({
        success: true,
        message: "Mascota no encontrada",
        data: null,
      });
    }

    res.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error("Error al obtener detalles de mascota:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener detalles de la mascota",
    });
  }
});

/* ==========================================================
   GET /v1/pet/:id
   ----------------------------------------------------------
   Obtiene todos los datos completos de una mascota según su ID.
   Incluye su clasificación, tipo, raza y género.
========================================================== */
petsRouter.get("/pet/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        m.mas_id_mascota AS id_mascota,
        m.mas_nombre AS nombre_mascota,

        c.mas_id_clasificacion_animal AS clasificacion_id,
        c.mas_descripcion AS clasificacion_nombre,

        t.mas_id_tipo_mascota AS tipo_id,
        t.mas_descripcion AS tipo_mascota,

        r.mas_id_raza AS raza_id,
        r.mas_descripcion AS raza,

        g.gen_id_genero_sexo AS genero_id,
        g.gen_nombre AS genero,

        m.mas_fecha_nacimiento,
        m.mas_estado,
        m.mas_observaciones
      FROM mas_mascota m
      INNER JOIN mas_tipo_mascota t 
        ON m.mas_id_tipo_mascota_fk = t.mas_id_tipo_mascota
      INNER JOIN mas_raza r 
        ON m.mas_id_raza_fk = r.mas_id_raza
      INNER JOIN mas_clasificacion_animal c 
        ON t.mas_id_clasificacion_animal_fk = c.mas_id_clasificacion_animal
      INNER JOIN gen_generosexo g 
        ON m.mas_id_genero_sexo_fk = g.gen_id_genero_sexo
      WHERE m.mas_id_mascota = ?
      ORDER BY id_mascota;
    `;

    const result = await query(sql, [id]);

    if (result.length === 0) {
      return res.json({
        success: true,
        message: "Mascota no encontrada",
        data: null,
      });
    }

    res.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error("Error al obtener mascota:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener mascota",
    });
  }
});

/* ==========================================================
   GET /v1/pets/types
   ----------------------------------------------------------
   Devuelve una estructura jerárquica con:
   Clasificaciones → Tipos → Razas.
   Cada elemento incluye sus respectivos IDs.
========================================================== */
petsRouter.get("/pets/types", async (req, res) => {
  try {
    const sql = `
      SELECT 
        ca.mas_id_clasificacion_animal AS id_clasificacion,
        ca.mas_descripcion AS clasificacion_animal,
        tm.mas_id_tipo_mascota AS id_tipo,
        tm.mas_descripcion AS tipo_animal,
        r.mas_id_raza AS id_raza,
        r.mas_descripcion AS raza
      FROM mas_clasificacion_animal ca
      LEFT JOIN mas_tipo_mascota tm 
        ON tm.mas_id_clasificacion_animal_fk = ca.mas_id_clasificacion_animal
      LEFT JOIN mas_raza r 
        ON r.mas_id_tipo_mascota_fk = tm.mas_id_tipo_mascota
      ORDER BY ca.mas_descripcion, tm.mas_descripcion, r.mas_descripcion;
    `;

    const rows = await query(sql);

    // Construcción de estructura anidada (clasificación > tipo > raza)
    const data = [];
    const clasificacionesMap = {};

    for (const row of rows) {
      if (!clasificacionesMap[row.id_clasificacion]) {
        clasificacionesMap[row.id_clasificacion] = {
          id: row.id_clasificacion,
          nombre: row.clasificacion_animal,
          tipos: [],
        };
        data.push(clasificacionesMap[row.id_clasificacion]);
      }

      if (row.id_tipo) {
        let tipo = clasificacionesMap[row.id_clasificacion].tipos.find(t => t.id === row.id_tipo);
        if (!tipo) {
          tipo = { id: row.id_tipo, nombre: row.tipo_animal, razas: [] };
          clasificacionesMap[row.id_clasificacion].tipos.push(tipo);
        }

        if (row.id_raza) {
          tipo.razas.push({ id: row.id_raza, nombre: row.raza });
        }
      }
    }

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error("Error al obtener clasificación, tipo y razas:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener los datos",
    });
  }
});

/* ==========================================================
   GET /v1/pets/types/:clasificacionId
   ----------------------------------------------------------
   Devuelve todos los tipos de mascota pertenecientes
   a una clasificación específica.
========================================================== */
petsRouter.get("/pets/types/:clasificacionId", async (req, res) => {
  try {
    const { clasificacionId } = req.params;

    const sql = `
      SELECT 
        mas_id_tipo_mascota AS id,
        mas_descripcion AS nombre
      FROM mas_tipo_mascota
      WHERE mas_id_clasificacion_animal_fk = ?
      ORDER BY mas_descripcion;
    `;

    const tipos = await query(sql, [clasificacionId]);
    res.json({ success: true, data: tipos });
  } catch (error) {
    console.error("Error al obtener tipos por clasificación:", error);
    res.status(500).json({ success: false, error: "Error al obtener tipos" });
  }
});

/* ==========================================================
   GET /v1/pets/breeds/:tipoId
   ----------------------------------------------------------
   Devuelve las razas asociadas a un tipo de mascota.
========================================================== */
petsRouter.get("/pets/breeds/:tipoId", async (req, res) => {
  try {
    const { tipoId } = req.params;

    const sql = `
      SELECT 
        mas_id_raza AS id,
        mas_descripcion AS nombre
      FROM mas_raza
      WHERE mas_id_tipo_mascota_fk = ?
      ORDER BY mas_descripcion;
    `;

    const razas = await query(sql, [tipoId]);
    res.json({ success: true, data: razas });
  } catch (error) {
    console.error("Error al obtener razas por tipo:", error);
    res.status(500).json({ success: false, error: "Error al obtener razas" });
  }
});

/* ==========================================================
   POST /v1/pets/classifications
   ----------------------------------------------------------
   Inserta una nueva clasificación animal.
========================================================== */
petsRouter.post("/pets/classifications", async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre)
      return res.status(400).json({ success: false, error: "El nombre de la clasificación es obligatorio" });

    const sql = `
      INSERT INTO mas_clasificacion_animal (mas_id_modulo_origen, mas_descripcion)
      VALUES (2, ?);
    `;

    const result = await query(sql, [nombre]);

    res.json({
      success: true,
      message: "Clasificación agregada correctamente",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error al agregar clasificación:", error);
    res.status(500).json({ success: false, error: "Error al agregar clasificación" });
  }
});

/* ==========================================================
   POST /v1/pets/types
   ----------------------------------------------------------
   Crea un nuevo tipo de mascota asociado a una clasificación.
========================================================== */
petsRouter.post("/pets/types", async (req, res) => {
  try {
    const { nombre, clasificacion_id } = req.body;
    if (!nombre || !clasificacion_id)
      return res.status(400).json({ success: false, error: "Datos incompletos: se requiere nombre y clasificacion_id" });

    const sql = `
      INSERT INTO mas_tipo_mascota (mas_id_modulo_origen, mas_descripcion, mas_id_clasificacion_animal_fk)
      VALUES (2, ?, ?);
    `;

    const result = await query(sql, [nombre, clasificacion_id]);

    res.json({
      success: true,
      message: "Tipo de mascota agregado correctamente",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error al agregar tipo:", error);
    res.status(500).json({ success: false, error: "Error al agregar tipo" });
  }
});

/* ==========================================================
   POST /v1/pets/breeds
   ----------------------------------------------------------
   Crea una nueva raza asociada a un tipo de mascota.
========================================================== */
petsRouter.post("/pets/breeds", async (req, res) => {
  try {
    const { nombre, tipo_id } = req.body;
    if (!nombre || !tipo_id)
      return res.status(400).json({ success: false, error: "Datos incompletos: se requiere nombre y tipo_id" });

    const sql = `
      INSERT INTO mas_raza (mas_id_modulo_origen, mas_descripcion, mas_id_tipo_mascota_fk)
      VALUES (2, ?, ?);
    `;

    const result = await query(sql, [nombre, tipo_id]);

    res.json({
      success: true,
      message: "Raza agregada correctamente",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error al agregar raza:", error);
    res.status(500).json({ success: false, error: "Error al agregar raza" });
  }
});

/* ==========================================================
   GET /v1/pets/genders
   ----------------------------------------------------------
   Obtiene la lista de géneros disponibles para las mascotas.
========================================================== */
petsRouter.get("/pets/genders", async (req, res) => {
  try {
    const sql = `
      SELECT 
        Gen_id_genero_sexo AS id,
        Gen_nombre AS nombre
      FROM gen_generosexo
      WHERE Gen_id_estado_general = 1
      ORDER BY Gen_nombre;
    `;

    const result = await query(sql);

    res.json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.error("Error al obtener géneros:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener géneros",
    });
  }
});

/* ==========================================================
   POST /v1/pets
   ----------------------------------------------------------
   Registra una nueva mascota en la base de datos.
   Valida campos requeridos y posibles intentos de inyección SQL.
========================================================== */
petsRouter.post("/pets", async (req, res) => {
  try {
    const {
      nombre,
      fecha_nacimiento,
      raza_id,
      tipo_id,
      genero_id,
      observaciones,
    } = req.body;

    // Validación de campos obligatorios
    if (!nombre || !fecha_nacimiento || !raza_id || !tipo_id || !genero_id) {
      return res.status(400).json({ success: false, error: "Faltan campos obligatorios." });
    }

    // Validación de contenido inseguro
    const regexSQL = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|;|--|\*|\/\*)\b)/i;
    if (regexSQL.test(nombre) || regexSQL.test(observaciones || "")) {
      return res.status(400).json({ success: false, error: "Entrada inválida detectada." });
    }

    const sql = `
      INSERT INTO mas_mascota (
        mas_id_modulo_origen,
        mas_nombre,
        mas_fecha_nacimiento,
        mas_id_raza_fk,
        mas_id_tipo_mascota_fk,
        mas_id_cliente_fk,
        mas_id_genero_sexo_fk,
        mas_estado,
        mas_observaciones
      )
      VALUES (2, ?, ?, ?, ?, NULL, ?, 'A', ?);
    `;

    const params = [
      nombre.trim(),
      fecha_nacimiento,
      raza_id,
      tipo_id,
      genero_id,
      observaciones?.trim() || null,
    ];

    const result = await query(sql, params);

    res.json({
      success: true,
      message: "Mascota registrada correctamente.",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error al registrar mascota:", error);
    res.status(500).json({
      success: false,
      error: "Error interno al registrar la mascota.",
    });
  }
});

/* ==========================================================
   PUT /v1/pet/:id
   ----------------------------------------------------------
   Actualiza los datos de una mascota existente.
   Valida la entrada y evita inyección SQL.
========================================================== */
petsRouter.put("/pet/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      fecha_nacimiento,
      raza_id,
      tipo_id,
      genero_id,
      observaciones,
      mas_estado,
    } = req.body;

    if (!id || !nombre || !fecha_nacimiento || !raza_id || !tipo_id || !genero_id) {
      return res.status(400).json({
        success: false,
        error: "Datos incompletos: se requieren todos los campos obligatorios",
      });
    }

    const regexSQL = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|;|--|\*|\/\*)\b)/i;
    if (regexSQL.test(nombre) || regexSQL.test(observaciones || "")) {
      return res.status(400).json({
        success: false,
        error: "Entrada inválida detectada. No uses palabras reservadas SQL.",
      });
    }

    // Si no se especifica el estado, se mantiene el actual
    let estadoFinal = mas_estado;
    if (!estadoFinal) {
      const estadoQuery = await query(
        "SELECT mas_estado FROM mas_mascota WHERE mas_id_mascota = ?",
        [id]
      );
      if (estadoQuery.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Mascota no encontrada.",
        });
      }
      estadoFinal = estadoQuery[0].mas_estado;
    }

    const sql = `
      UPDATE mas_mascota
      SET 
        mas_nombre = ?,
        mas_fecha_nacimiento = ?,
        mas_id_raza_fk = ?,
        mas_id_tipo_mascota_fk = ?,
        mas_id_genero_sexo_fk = ?,
        mas_observaciones = ?,
        mas_estado = ?
      WHERE mas_id_mascota = ?;
    `;

    const result = await query(sql, [
      nombre,
      fecha_nacimiento,
      raza_id,
      tipo_id,
      genero_id,
      observaciones,
      estadoFinal,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "No se encontró la mascota especificada",
      });
    }

    res.json({
      success: true,
      message: "Mascota actualizada correctamente",
    });
  } catch (error) {
    console.error("Error al actualizar mascota:", error);
    res.status(500).json({
      success: false,
      error: "Error al actualizar los datos de la mascota",
    });
  }
});

/* ==========================================================
   DELETE /v1/pet/:id
   ----------------------------------------------------------
   Elimina una mascota de la base de datos por su ID.
========================================================== */
petsRouter.delete("/pet/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id)
      return res.status(400).json({ success: false, error: "ID de mascota requerido" });

    const sql = "DELETE FROM mas_mascota WHERE mas_id_mascota = ?";
    const result = await query(sql, [id]);

    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, error: "Mascota no encontrada" });

    res.json({
      success: true,
      message: "Mascota eliminada correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar mascota:", error);
    res.status(500).json({
      success: false,
      error: "Error al eliminar la mascota",
    });
  }
});