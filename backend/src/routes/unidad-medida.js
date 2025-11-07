import express from "express";

import { query, getPool } from "../config/database.js";

export const unidadMedidaRouter = express.Router();

const tableName = "Gen_UnidadMedida";
const idField = "Gen_id_unidad_medida";
const fields = [
  { name: "Gen_modulo_origen", default: 1 },
  { name: "Gen_codigo", default: "" },
  { name: "Gen_nombre", default: "" },
  { name: "Gen_tipo_unidad", default: null },
  { name: "Gen_id_estado_general", default: 1 },
];

unidadMedidaRouter.get("/", async (req, res) => {
  try {
    const rows = await query(`SELECT * FROM ${tableName}`);
    res.json(rows);
  } catch (error) {
    console.error(`Error fetching ${tableName}:`, error);
    res.status(500).json({ error: `Error al obtener ${tableName}` });
  }
});

unidadMedidaRouter.get("/:id", async (req, res) => {
  try {
    const rows = await query(`SELECT * FROM ${tableName} WHERE ${idField} = ?`, [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "No encontrado" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(`Error fetching ${tableName}:`, error);
    res.status(500).json({ error: `Error al obtener ${tableName}` });
  }
});

unidadMedidaRouter.post("/", async (req, res) => {
  try {
    const fieldNames = fields.map((f) => f.name).join(", ");
    const placeholders = fields.map(() => "?").join(", ");
    const values = fields.map((f) => {
      const value = req.body[f.name];
      if (value === undefined || value === "") {
        return f.default !== undefined ? f.default : null;
      }
      return value;
    });

    const connection = getPool();
    const [result] = await connection.execute(
      `INSERT INTO ${tableName} (${fieldNames}) VALUES (${placeholders})`,
      values
    );
    res.json({ [idField]: result.insertId, ...req.body });
  } catch (error) {
    console.error(`Error creating ${tableName}:`, error);
    res.status(500).json({ error: `Error al crear ${tableName}: ${error.message}` });
  }
});

unidadMedidaRouter.put("/:id", async (req, res) => {
  try {
    const setClause = fields.map((f) => `${f.name} = ?`).join(", ");
    const values = [
      ...fields.map((f) => {
        const value = req.body[f.name];
        if (value === undefined || value === "") {
          return f.default !== undefined ? f.default : null;
        }
        return value;
      }),
      req.params.id,
    ];

    await query(`UPDATE ${tableName} SET ${setClause} WHERE ${idField} = ?`, values);
    res.json({ [idField]: req.params.id, ...req.body });
  } catch (error) {
    console.error(`Error updating ${tableName}:`, error);
    res.status(500).json({ error: `Error al actualizar ${tableName}: ${error.message}` });
  }
});

unidadMedidaRouter.delete("/:id", async (req, res) => {
  try {
    await query(`DELETE FROM ${tableName} WHERE ${idField} = ?`, [req.params.id]);
    res.json({ message: "Eliminado correctamente" });
  } catch (error) {
    console.error(`Error deleting ${tableName}:`, error);
    res.status(500).json({ error: `Error al eliminar ${tableName}` });
  }
});

