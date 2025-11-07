import { query } from "../../config/database.js";

export const getAllEspecialidades = async () => {
  return await query("SELECT * FROM vet_especialidades");
};


export const createEspecialidad = async (data) => {
  const { Esp_Nombre, Esp_Descripcion } = data;
  const [result] = await pool.query(
    `INSERT INTO vet_especialidades (Esp_Nombre, Esp_Descripcion) VALUES (?, ?)`,
    [Esp_Nombre, Esp_Descripcion]
  );
};