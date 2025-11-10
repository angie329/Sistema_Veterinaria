import express from "express";
import { appointments, notifications, veterinarios, estadosCita, agendas } from "./mockData.js";
import { getDashboard } from "../controllers/dashboard.controller.js";

export const dashboardRouter = express.Router();

// === Rutas de tu rama (mock data) ===

// GET Veterinarios
dashboardRouter.get("/veterinarians", (req, res) => res.json(veterinarios));

// GET Estados de cita
dashboardRouter.get("/appointment-states", (req, res) => res.json(estadosCita));

// GET Agenda por veterinario
dashboardRouter.get("/veterinarians/:vetId/schedule", (req, res) => {
  const vetId = parseInt(req.params.vetId);
  const agenda = agendas[vetId] || [];
  res.json(agenda.map(a => ({
    day: a.dia_semana,
    start: a.hora_inicio,
    end: a.hora_fin,
    shift: a.turno
  })));
});

// GET Citas
dashboardRouter.get("/appointments", (req, res) => res.json(appointments));

// POST Crear cita
dashboardRouter.post("/appointments", (req, res) => {
  const newCita = { id: Date.now(), ...req.body };
  appointments.push(newCita);

  notifications.push({
    id: Date.now(),
    mensaje: `Nueva cita registrada para ${newCita.clientName}`,
    fecha_hora_envio: new Date(),
    tipo_destinatario: "Cliente",
    estado_envio: "Enviado"
  });

  res.json(newCita);
});

// PUT Actualizar cita
dashboardRouter.put("/appointments/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = appointments.findIndex(a => a.id === id);
  if (index === -1) return res.status(404).json({ error: "Cita no encontrada" });

  appointments[index] = { ...appointments[index], ...req.body };

  notifications.push({
    id: Date.now(),
    mensaje: `Cita de ${appointments[index].clientName} actualizada`,
    fecha_hora_envio: new Date(),
    tipo_destinatario: "Cliente",
    estado_envio: "Enviado"
  });

  res.json(appointments[index]);
});

// DELETE Cita
dashboardRouter.delete("/appointments/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const cita = appointments.find(a => a.id === id);
  if (!cita) return res.status(404).json({ error: "Cita no encontrada" });

  appointments = appointments.filter(a => a.id !== id);

  notifications.push({
    id: Date.now(),
    mensaje: `Cita de ${cita.clientName} eliminada`,
    fecha_hora_envio: new Date(),
    tipo_destinatario: "Cliente",
    estado_envio: "Enviado"
  });

  res.json({ success: true });
});

// GET Notificaciones
dashboardRouter.get("/notifications", (req, res) => res.json(notifications));

// === Ruta del main (controller) ===
dashboardRouter.get("/dashboard", getDashboard);
