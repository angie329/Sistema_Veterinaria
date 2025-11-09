import { query } from "../config/database.js";


export const getAllEspecialidades = async () => {
  return await query(`
    SELECT id_Especialidad, Esp_Nombre 
    FROM vet_especialidades
    ORDER BY id_Especialidad;
  `);
};


export const createEspecialidad = async (data) => {
  const { Esp_Nombre } = data;
  await query(
    `INSERT INTO vet_especialidades (Esp_Nombre)
     VALUES (?)`,
    [Esp_Nombre]
  );
};
