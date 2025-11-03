import express from "express";

export const dashboardRouter = express.Router();

dashboardRouter.get("/dashboard", async (req, res) => {
  try {
    const dashboardData = {
      metrics: {
        totalClients: 247,
        totalPets: 389,
        todayAppointments: 12,
        pendingAppointments: 8,
        monthlyRevenue: 15420.5,
        activeVeterinarians: 5,
        lowStockAlerts: 3,
        completedAppointments: 156,
      },
      upcomingAppointments: [
        {
          id: 1,
          time: "09:00",
          clientName: "María González",
          petName: "Max",
          petType: "Perro",
          reason: "Consulta general",
          veterinarian: "Dr. Carlos Mendoza",
          status: "confirmed",
        },
        {
          id: 2,
          time: "10:30",
          clientName: "Juan Pérez",
          petName: "Luna",
          petType: "Gato",
          reason: "Vacunación anual",
          veterinarian: "Dra. Ana Martínez",
          status: "confirmed",
        },
        {
          id: 3,
          time: "11:15",
          clientName: "Roberto Silva",
          petName: "Rocky",
          petType: "Perro",
          reason: "Control post-operatorio",
          veterinarian: "Dr. Carlos Mendoza",
          status: "pending",
        },
        {
          id: 4,
          time: "14:00",
          clientName: "Laura Torres",
          petName: "Milo",
          petType: "Gato",
          reason: "Desparasitación",
          veterinarian: "Dra. Ana Martínez",
          status: "confirmed",
        },
        {
          id: 5,
          time: "15:30",
          clientName: "Diego Ramírez",
          petName: "Bella",
          petType: "Perro",
          reason: "Limpieza dental",
          veterinarian: "Dr. Luis Herrera",
          status: "confirmed",
        },
      ],
      recentActivity: [
        {
          id: 1,
          type: "appointment",
          message: "Cita completada: Max - Consulta general",
          clientName: "María González",
          timestamp: "2024-01-15T08:30:00",
          icon: "check-circle",
        },
        {
          id: 2,
          type: "client",
          message: "Nuevo cliente registrado: Sofía Morales",
          clientName: "Sofía Morales",
          timestamp: "2024-01-15T07:45:00",
          icon: "user-plus",
        },
        {
          id: 3,
          type: "pet",
          message: "Nueva mascota registrada: Coco",
          clientName: "Pedro Castro",
          timestamp: "2024-01-14T18:20:00",
          icon: "dog",
        },
        {
          id: 4,
          type: "payment",
          message: "Pago recibido: $150.00",
          clientName: "Andrea Fernández",
          timestamp: "2024-01-14T16:15:00",
          icon: "dollar-sign",
        },
        {
          id: 5,
          type: "inventory",
          message: "Alerta de inventario: Vacuna contra rabia baja en stock",
          clientName: null,
          timestamp: "2024-01-14T14:30:00",
          icon: "alert-triangle",
        },
        {
          id: 6,
          type: "appointment",
          message: "Cita cancelada: Charlie - Cirugía",
          clientName: "Fernando López",
          timestamp: "2024-01-14T12:00:00",
          icon: "x-circle",
        },
      ],
      monthlyStats: {
        appointments: {
          total: 156,
          completed: 142,
          cancelled: 8,
          pending: 6,
        },
        revenue: {
          current: 15420.5,
          previous: 12850.75,
          growth: 19.9,
        },
      },
    };

    res.json(dashboardData);
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    res.status(500).json({ error: "Error al obtener datos del dashboard" });
  }
});
