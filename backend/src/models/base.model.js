import { query, getPool } from "../config/database.js";

/**
 * Modelo base genérico para tablas Gen_*
 * @param {string} tableName - Nombre de la tabla
 * @param {string} idField - Nombre del campo ID
 * @param {Array} fields - Array de objetos con {name, default}
 */
export const createGenericModel = (tableName, idField, fields) => {
  const getValuesFromBody = (body) => {
    return fields.map((f) => {
      const value = body[f.name];
      if (value === undefined || value === "") {
        return f.default !== undefined ? f.default : null;
      }
      return value;
    });
  };

  const getAll = async () => {
    return await query(`SELECT * FROM ${tableName}`);
  };

  const getById = async (id) => {
    const rows = await query(
      `SELECT * FROM ${tableName} WHERE ${idField} = ?`,
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  };

  const create = async (body) => {
    const fieldNames = fields.map((f) => f.name).join(", ");
    const placeholders = fields.map(() => "?").join(", ");
    const values = getValuesFromBody(body);

    const connection = getPool();
    const [result] = await connection.execute(
      `INSERT INTO ${tableName} (${fieldNames}) VALUES (${placeholders})`,
      values
    );

    return { [idField]: result.insertId, ...body };
  };

  const update = async (id, body) => {
    const setClause = fields.map((f) => `${f.name} = ?`).join(", ");
    const values = [...getValuesFromBody(body), id];

    await query(
      `UPDATE ${tableName} SET ${setClause} WHERE ${idField} = ?`,
      values
    );

    return { [idField]: id, ...body };
  };

  const remove = async (id) => {
    await query(`DELETE FROM ${tableName} WHERE ${idField} = ?`, [id]);
  };

  return { getAll, getById, create, update, remove };
};

