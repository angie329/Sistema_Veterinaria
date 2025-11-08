
import dotenv from "dotenv";
dotenv.config();

import { getPool } from "./src/config/database.js";

async function testDBConnection() {

  console.log("DB_USER:", process.env.DB_USER);
  console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
  try {
    const pool = getPool();
    const connection = await pool.getConnection();
    console.log("Conexión a la base de datos exitosa.");
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error);
    process.exit(1);
  }
  
}

testDBConnection();