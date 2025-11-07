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
    m.mas_id_genero_sexo_fk AS genero,
    m.mas_fecha_nacimiento,
    m.mas_estado,
    m.mas_observaciones
    FROM mas_mascota m
    INNER JOIN mas_tipo_mascota t 
    ON m.mas_id_tipo_mascota_fk = t.mas_id_tipo_mascota
    INNER JOIN mas_raza r 
    ON m.mas_id_raza_fk = r.mas_id_raza
    #INNER JOIN gen_generosexo g 
    #    ON m.mas_id_genero_sexo_fk = g.gen_id_genero_sexo
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
