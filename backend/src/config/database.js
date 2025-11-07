import mysql from "mysql2/promise";

import { config } from "./env.js";

let pool = null;

export const getPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: config.DB.host,
      port: config.DB.port,
      user: config.DB.user,
      password: config.DB.password,
      database: config.DB.database,
      ssl: config.DB.ssl,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
};

export const query = async (sql, params) => {
  const connection = getPool();
  const [rows] = await connection.execute(sql, params);
  return rows;
};
