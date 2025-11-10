import { query } from "../config/database.js";

export const getAllVeterinarios = async () => {
  return await query(`
    SELECT 
      v.id_Veterinario,
      v.Vet_Nombres,
      v.Vet_Apellidos,
      v.Vet_Telefono,
      v.Vet_Correo,
      e.Esp_Nombre AS Especialidad,
      v.Vet_Estado AS Estado,
      v.created_at,
      v.updated_at
    FROM vet_veterinarios v
    LEFT JOIN vet_especialidades e
      ON v.id_Especialidad_FK = e.id_Especialidad
    WHERE v.Vet_Estado = 'Activo'
    ORDER BY v.Vet_Apellidos;
  `);
};

export const createVeterinario = async (data) => {
  const {
    Vet_Nombres,
    Vet_Apellidos,
    Vet_Correo,
    Vet_Telefono,
    EspecialidadNombre,
  } = data;

  const rows = await query(
    `SELECT id_Especialidad FROM vet_especialidades WHERE Esp_Nombre = ? LIMIT 1`,
    [EspecialidadNombre]
  );

  const idEsp = Array.isArray(rows)
    ? rows[0]?.id_Especialidad
    : rows?.id_Especialidad;

  if (!idEsp) throw new Error("Especialidad no encontrada");

  await query(
    `INSERT INTO vet_veterinarios (Vet_Nombres, Vet_Apellidos, Vet_Correo, Vet_Telefono, id_Especialidad_FK)
     VALUES (?, ?, ?, ?, ?)`,
    [Vet_Nombres, Vet_Apellidos, Vet_Correo, Vet_Telefono, idEsp]
  );
};

export const deleteVeterinario = async (id) => {
  await query(
    `UPDATE vet_veterinarios
     SET Vet_Estado = 'Inactivo'
     WHERE id_Veterinario = ?`,
    [id]
  );
};

export const updateVeterinario = async (id, data) => {
  const {
    Vet_Nombres,
    Vet_Apellidos,
    Vet_Correo,
    Vet_Telefono,
    EspecialidadNombre,
  } = data;

  const rows = await query(
    `SELECT id_Especialidad
     FROM vet_especialidades
     WHERE LOWER(TRIM(Esp_Nombre)) = LOWER(TRIM(?))
     LIMIT 1`,
    [EspecialidadNombre]
  );

  const idEsp = Array.isArray(rows)
    ? rows[0]?.id_Especialidad
    : rows?.id_Especialidad;

  if (!idEsp) throw new Error("Especialidad no encontrada");

  await query(
    `UPDATE vet_veterinarios
     SET Vet_Nombres = ?, Vet_Apellidos = ?, Vet_Correo = ?, Vet_Telefono = ?, id_Especialidad_FK = ?
     WHERE id_Veterinario = ?`,
    [Vet_Nombres, Vet_Apellidos, Vet_Correo, Vet_Telefono, idEsp, id]
  );
};
