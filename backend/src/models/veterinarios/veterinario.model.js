import { query } from "../../config/database.js";

export const getAllVeterinarios = async () => {
  return await query(`
    SELECT 
      v.id_Veterinario,
      v.Vet_Nombres,
      v.Vet_Apellidos,
      v.Vet_Telefono,
      v.Vet_Correo,
      e.Esp_Nombre AS Especialidad
    FROM vet_veterinarios v
    LEFT JOIN vet_especialidades e
      ON v.id_Especialidad_FK = e.id_Especialidad
    ORDER BY v.Vet_Apellidos;
  `);
};


export const createVeterinario = async (data) => {
  const { Vet_Nombres, Vet_Apellidos, Vet_Correo, Vet_Telefono,id_Especialidad_FK} = data;
  await query(
    `INSERT INTO vet_veterinarios (Vet_Nombres, Vet_Apellidos,Vet_Correo, Vet_Telefono)
     VALUES (?, ?, ?, ?, ?)`,
    [Vet_Nombres, Vet_Apellidos, Vet_Correo, Vet_Telefono, Vet_Direccion,id_Especialidad_FK]
  );
};

export const deleteVeterinario = async (id) => {
  await query("DELETE FROM vet_veterinarios WHERE id_Veterinario = ?", [id]);
};

export const updateVeterinario = async (id, data) => {
  const { Vet_Nombres, Vet_Apellidos, Vet_Correo, Vet_Telefono } = data;
  await query(
    `UPDATE vet_veterinarios 
     SET Vet_Nombres=?, Vet_Apellidos=?, Vet_Correo=?, Vet_Telefono=?
     WHERE id_Veterinario=?`,
    [Vet_Nombres, Vet_Apellidos, Vet_Correo, Vet_Telefono, id]
  );
};
