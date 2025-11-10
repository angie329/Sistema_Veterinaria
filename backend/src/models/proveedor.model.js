import { query, getPool } from "../config/database.js";
import { MODULE_IDS } from "../constants/modules.js";

const TABLE_NAME = "Gen_Proveedores";
const ID_FIELD = "Gen_id_proveedor";
const FIELDS = [
  { name: "Gen_modulo_origen", default: MODULE_IDS.MODULO_GENERAL },
  { name: "Gen_nombre", default: "" },
  { name: "Gen_direccion", default: null },
  { name: "Gen_telefono", default: null },
  { name: "Gen_email", default: null },
  { name: "Gen_producto_servicio", default: "" },
  { name: "Gen_id_estado_general", default: 1 },
];

const getValuesFromBody = (body) => {
  return FIELDS.map((f) => {
    const value = body[f.name];
    if (value === undefined || value === "") {
      return f.default !== undefined ? f.default : null;
    }
    return value;
  });
};

export const getAllProveedores = async () => {
  return await query(`SELECT * FROM ${TABLE_NAME}`);
};

export const getProveedorById = async (id) => {
  const rows = await query(
    `SELECT * FROM ${TABLE_NAME} WHERE ${ID_FIELD} = ?`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

export const createProveedor = async (body) => {
  const fieldNames = FIELDS.map((f) => f.name).join(", ");
  const placeholders = FIELDS.map(() => "?").join(", ");
  const values = getValuesFromBody(body);

  const connection = getPool();
  const [result] = await connection.execute(
    `INSERT INTO ${TABLE_NAME} (${fieldNames}) VALUES (${placeholders})`,
    values
  );

  return { [ID_FIELD]: result.insertId, ...body };
};

export const updateProveedor = async (id, body) => {
  const setClause = FIELDS.map((f) => `${f.name} = ?`).join(", ");
  const values = [...getValuesFromBody(body), id];

  await query(
    `UPDATE ${TABLE_NAME} SET ${setClause} WHERE ${ID_FIELD} = ?`,
    values
  );

  return { [ID_FIELD]: id, ...body };
};

export const deleteProveedor = async (id) => {
  await query(`DELETE FROM ${TABLE_NAME} WHERE ${ID_FIELD} = ?`, [id]);
};
