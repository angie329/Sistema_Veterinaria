import express from "express";
import { query } from "../config/database.js";

export const petsRouter = express.Router();

petsRouter.get("/pets", async (req, res) => {
  try {

    let textQuery =
      `SELECT 
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
    ORDER BY id_mascota
    ;`;

    const rows = await query(textQuery);
    // Siempre devolver un JSON, aunque esté vacío
    res.json({
      success: true,
      count: rows.length,
      data: rows, // puede ser []
    });
  } catch (error) {
    console.error("Error al obtener mascotas:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener los datos de las mascotas",
    });
  }
});

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
   GET /v1/pets/types
   Devuelve clasificaciones, tipos y razas con sus IDs reales
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
    res.json({
      success: true,
      count: data.length,
      data,
    })

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
   Devuelve los tipos de mascota pertenecientes a una clasificación
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
   Devuelve las razas de un tipo de mascota específico
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
   Inserta una nueva clasificación animal
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
   Inserta un nuevo tipo de mascota asociado a una clasificación
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
   Inserta una nueva raza asociada a un tipo de mascota
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
   Devuelve la lista de géneros del animal
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
   Registra una nueva mascota
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

    // ✅ Validación de campos requeridos
    if (!nombre || !fecha_nacimiento || !raza_id || !tipo_id || !genero_id) {
      return res
        .status(400)
        .json({ success: false, error: "Faltan campos obligatorios." });
    }

    // ✅ Validar posibles intentos de inyección SQL en campos de texto
    const regexSQL = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|;|--|\*|\/\*)\b)/i;
    if (regexSQL.test(nombre) || regexSQL.test(observaciones || "")) {
      return res
        .status(400)
        .json({ success: false, error: "Entrada inválida detectada." });
    }

    // ✅ Inserción segura (prepared statements con parámetros)
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
