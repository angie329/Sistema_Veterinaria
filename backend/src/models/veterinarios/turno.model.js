import { query } from "../../config/database.js";

export const getAllTurnos = async (idVeterinario) => {
  return await query(`
    SELECT 
      t.id_Turno,
      t.Tur_Dia,
      t.Tur_HoraInicio,
      t.Tur_HoraFin,
      t.Tur_Tipo,
      t.id_modulo,
      t.created_at,
      t.updated_at,
      CASE
        WHEN t.id_Calendario_FK IS NOT NULL THEN 'Sí'
        ELSE 'No'
      END AS VinculadoCalendario
    FROM vet_turnos t
    WHERE t.id_Veterinario_FK = ?
    ORDER BY FIELD(t.Tur_Dia, 'Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo');
  `, [idVeterinario]);
};