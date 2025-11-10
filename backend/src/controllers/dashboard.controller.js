import { getDashboardMetrics, getTodayAppointments } from "../models/dashboard.model.js";

export const getDashboard = async (req, res) => {
  try {
    const metrics = await getDashboardMetrics();
    const upcomingAppointments = await getTodayAppointments();

    const dashboardData = {
      metrics,
      upcomingAppointments: upcomingAppointments || [],
    };

    res.json(dashboardData);
  } catch (error) {
    console.error("Error fetching Dashboard:", error);
    res.status(500).json({
      error: `Error al obtener datos del dashboard: ${
        error.message || ""
      }`.trim(),
    });
  }
};

