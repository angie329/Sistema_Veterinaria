import express from "express";

import { query, getPool } from "../config/database.js";

export const generoSexoRouter = express.Router();

const tableName = "Gen_GeneroSexo";
const idField = "Gen_id_genero_sexo";
const fields = [
  { name: "Gen_modulo_origen", default: 1 },
  { name: "Gen_nombre", default: "" },
  { name: "Gen_id_estado_general", default: 1 },
];
/**
 * Obtiene los valores del body de la solicitud, aplicando defaults
 * si el valor es undefined o una cadena vacía.
 */
const getValuesFromRequestBody = (body) => {
  return fields.map((f) => {
    const value = body[f.name];
    if (value === undefined || value === "") {
      return f.default !== undefined ? f.default : null;
    }
    return value;
  });
};

/**
 * Función genérica para manejar errores.
 */
const handleError = (res, operation, error) => {
  console.error(`Error ${operation} ${tableName}:`, error);
  const baseMessage = `Error al ${operation === 'fetching' ? 'obtener' : operation === 'creating' ? 'crear' : operation === 'updating' ? 'actualizar' : 'eliminar'} ${tableName}`;
  const errorMessage = (operation === 'creating' || operation === 'updating') ? `: ${error.message || ''}` : '';
  res.status(500).json({ error: `${baseMessage}${errorMessage}`.trim() });
};

generoSexoRouter.get("/", async (req, res) => {
  try {
    const rows = await query(`SELECT * FROM ${tableName}`);
    res.json(rows);
  } catch (error) {
    handleError(res, "fetching", error);
  }
});

generoSexoRouter.get("/:id", async (req, res) => {
  try {
    const rows = await query(`SELECT * FROM ${tableName} WHERE ${idField} = ?`, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "No encontrado" });
    }
    res.json(rows[0]);
  } catch (error) {
    handleError(res, "fetching", error);
  }
});

generoSexoRouter.post("/", async (req, res) => {
  try {
    const fieldNames = fields.map((f) => f.name).join(", ");
    const placeholders = fields.map(() => "?").join(", ");
    const values = getValuesFromRequestBody(req.body);

    const connection = getPool();
    const [result] = await connection.execute(
      `INSERT INTO ${tableName} (${fieldNames}) VALUES (${placeholders})`,
      values
    );
    res.json({ [idField]: result.insertId, ...req.body });
  } catch (error) {
    handleError(res, "creating", error);
  }
});

generoSexoRouter.put("/:id", async (req, res) => {
  try {
    const setClause = fields.map((f) => `${f.name} = ?`).join(", ");
    const values = [
      ...getValuesFromRequestBody(req.body),
      req.params.id, 
    ];

    await query(`UPDATE ${tableName} SET ${setClause} WHERE ${idField} = ?`, values);
    res.json({ [idField]: req.params.id, ...req.body });
  } catch (error) {
    handleError(res, "updating", error);
  }
});

generoSexoRouter.delete("/:id", async (req, res) => {
  try {
    await query(`DELETE FROM ${tableName} WHERE ${idField} = ?`, [req.params.id]);
    res.json({ message: "Eliminado correctamente" });
  } catch (error) {
    handleError(res, "deleting", error);
  }
});

