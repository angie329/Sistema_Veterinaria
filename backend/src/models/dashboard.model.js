import { query } from "../config/database.js";

export const getDashboardMetrics = async () => {
  const [
    totalClientsResult,
    totalPetsResult,
    activeVetsResult,
    pendingAppsResult,
  ] = await Promise.all([
    query(
      `SELECT COUNT(id_Clientes) AS totalClients FROM clientes WHERE Cli_Estado = 1`
    ),
    query(
      `SELECT COUNT(mas_id_mascota) AS totalPets FROM mas_mascota WHERE mas_estado = 'A'`
    ),
    query(
      `SELECT COUNT(id_Veterinario) AS activeVeterinarians FROM vet_veterinarios WHERE Vet_Estado = 'Activo'`
    ),
    query(
      `SELECT COUNT(id_cita) AS pendingAppointments FROM cya_reserva_cita WHERE id_estado_cita = 2 AND DATE(fecha_hora_cita) >= CURDATE()`
    ),
  ]);

  return {
    totalClients: totalClientsResult[0]?.totalClients || 0,
    totalPets: totalPetsResult[0]?.totalPets || 0,
    activeVeterinarians: activeVetsResult[0]?.activeVeterinarians || 0,
    pendingAppointments: pendingAppsResult[0]?.pendingAppointments || 0,
  };
};

export const getTodayAppointments = async () => {
  return await query(`
    SELECT 
      DATE_FORMAT(fecha_hora_cita, '%H:%i') AS time,
      motivo AS reason
    FROM cya_reserva_cita
    WHERE DATE(fecha_hora_cita) = CURDATE() 
      AND id_estado_cita IN (1, 2)
    ORDER BY fecha_hora_cita ASC
    LIMIT 5
  `);
};
