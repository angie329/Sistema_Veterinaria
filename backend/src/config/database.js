import mysql from "mysql2/promise";
import { config } from "./env.js";

let pool = null;

export const getPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: config.DB.host,
      port: Number(config.DB.port || 3306),
      user: config.DB.user,
      password: config.DB.password,
      database: config.DB.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,

      ssl: {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true
      },
    });
  }
  return pool;
};

export const query = async (sql, params = []) => {
  const connection = getPool();
  const [rows] = await connection.execute(sql, params);
  return rows;
};