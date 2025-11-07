import { query } from "../../config/database.js";

export const getAllTurnos = async (idVeterinario) => {
  return await query(
    `SELECT 
        Tur_Dia, 
        Tur_HoraInicio, 
        Tur_HoraFin, 
        Tur_Tipo
     FROM vet_turnos
     WHERE id_Veterinario_FK = ?`,
    [idVeterinario]
  );
};

