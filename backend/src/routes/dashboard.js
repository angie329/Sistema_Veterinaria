import express from "express";
import { query } from "../config/database.js"; 

export const dashboardRouter = express.Router();

const handleError = (res, operation, error) => {
    console.error(`Error ${operation} Dashboard:`, error);
    res.status(500).json({ error: `Error al obtener datos del dashboard: ${error.message || ''}`.trim() });
};


dashboardRouter.get("/dashboard", async (req, res) => {
  try {
   
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
  
    const [
      totalClientsResult,
      totalPetsResult,
      activeVetsResult,
      revenueResult,
      completedAppsResult,
      pendingAppsResult,
    ] = await Promise.all([
      
      // 1. Clientes Totales (Contamos usuarios activos con rol que no sea SuperAdmin)
      query(`SELECT COUNT(id_aut_usuario) AS totalClients FROM aut_usuario WHERE aut_estado = 'Activo' AND id_aut_rol_fk != 1`),

      // 2. Mascotas Totales (Contamos mascotas con estado 'A' = Activo)
      query(`SELECT COUNT(mas_id_mascota) AS totalPets FROM mas_mascota WHERE mas_estado = 'A'`),
      
      // 3. Veterinarios Activos
      query(`SELECT COUNT(id_Veterinario) AS activeVeterinarians FROM vet_veterinarios`), 

      // 4. Ingresos Mensuales (Suma de fac_total para el mes actual)
      query(`
        SELECT SUM(fac_total) AS monthlyRevenue
        FROM fac_factura
        WHERE MONTH(fac_fecha) = ? AND YEAR(fac_fecha) = ?
      `, [currentMonth, currentYear]),

      // 5. Citas Completadas (Citas que terminaron en el mes actual - ID_ESTADO_COMPLETADO = 3)
      query(`
        SELECT COUNT(id_cita) AS completedAppointments
        FROM cya_reserva_cita
        WHERE id_estado_cita = 3 AND MONTH(fecha_hora_cita) = ? AND YEAR(fecha_hora_cita) = ?
      `, [currentMonth, currentYear]),

      // 6. Citas Pendientes de Hoy/Futuro (ID_ESTADO_PENDIENTE = 2)
      query(`
        SELECT COUNT(id_cita) AS pendingAppointments
        FROM cya_reserva_cita
        WHERE id_estado_cita = 2 AND DATE(fecha_hora_cita) >= CURDATE()
      `),
    ]);

    const upcomingAppointments = await query(`
        SELECT C.id_cita AS id, DATE_FORMAT(C.fecha_hora_cita, '%H:%i') AS time,
               CONCAT(V.Vet_Nombres, ' ', V.Vet_Apellidos) AS veterinarian,
               M.mas_nombre AS petName,
               T.mas_descripcion AS petType,
               C.motivo AS reason
               -- Asumiremos que el cliente no se guarda en cya_reserva_cita, solo la mascota y veterinario
        FROM cya_reserva_cita C
        JOIN vet_veterinarios V ON C.id_veterinario = V.id_Veterinario
        JOIN mas_mascota M ON C.id_mascota = M.mas_id_mascota
        JOIN mas_tipo_mascota T ON M.mas_id_tipo_mascota_fk = T.mas_id_tipo_mascota
        WHERE DATE(C.fecha_hora_cita) = CURDATE() AND C.id_estado_cita = 1
        ORDER BY C.fecha_hora_cita ASC
        LIMIT 5
    `);
    
    
    const dashboardData = {
      metrics: {
        totalClients: totalClientsResult[0]?.totalClients || 0,
        totalPets: totalPetsResult[0]?.totalPets || 0,
        // todayAppointments: se calcula restando Completadas y Canceladas de las totales de hoy
        todayAppointments: upcomingAppointments.length, // Usamos la lista de citas pendientes confirmadas para hoy
        pendingAppointments: pendingAppsResult[0]?.pendingAppointments || 0,
        monthlyRevenue: parseFloat(revenueResult[0]?.monthlyRevenue || 0.0),
        activeVeterinarians: activeVetsResult[0]?.activeVeterinarians || 0,
        lowStockAlerts: 0, // Necesita una query a INV_Articulo (StockActual < Umbral)
        completedAppointments: completedAppsResult[0]?.completedAppointments || 0,
      },
      upcomingAppointments: upcomingAppointments,
      recentActivity: [], 
      monthlyStats: {}, 
    };

    res.json(dashboardData);
  } catch (error) {
    handleError(res, "fetching", error);
  }
});