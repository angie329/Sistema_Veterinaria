import {
  getAllVeterinarians,
  getAllAppointmentStates,
  getVeterinarianSchedule,
  getAllAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../models/citas_agendas.js";

// ========== VETERINARIOS ==========
export const obtenerVeterinarios = async (req, res) => {
  try {
    const data = await getAllVeterinarians();
    res.json(data);
  } catch (error) {
    console.error("Error al obtener veterinarios:", error);
    res.status(500).json({ error: "Error al obtener veterinarios" });
  }
};

// ========== ESTADOS DE CITA ==========
export const obtenerEstadosCita = async (req, res) => {
  try {
    const data = await getAllAppointmentStates();
    res.json(data);
  } catch (error) {
    console.error("Error al obtener estados:", error);
    res.status(500).json({ error: "Error al obtener estados de cita" });
  }
};

// ========== AGENDA DE VETERINARIO ==========
export const obtenerAgendaVeterinario = async (req, res) => {
  try {
    const { veterinarianId } = req.params;
    const data = await getVeterinarianSchedule(veterinarianId);
    res.json(data);
  } catch (error) {
    console.error("Error al obtener agenda:", error);
    res.status(500).json({ error: "Error al obtener agenda del veterinario" });
  }
};

// ========== CITAS ==========
export const obtenerCitas = async (req, res) => {
  try {
    const data = await getAllAppointments();
    res.json(data);
  } catch (error) {
    console.error("Error al obtener citas:", error);
    res.status(500).json({ error: "Error al obtener citas" });
  }
};
/*
export const agregarCita = async (req, res) => {
  try {
    const result = await createAppointment(req.body);
	const citaId = result.insertId;
    
    // Retornar la cita creada
    const citas = await getAllAppointments();
    const nuevaCita = citas.find(c => c.id === citaId);
    
    res.status(201).json(nuevaCita || { id: citaId, mensaje: "Cita creada" });
  } catch (error) {
    console.error("Error al crear cita:", error);
    res.status(500).json({ error: "Error al crear la cita" });
  }
};
*/
export const agregarCita = async (req, res) => {
  try {
    console.log("📦 Datos recibidos del frontend:", req.body);
    const cita = req.body;
    const result = await createAppointment(cita);
    res.status(201).json(result);
  } catch (error) {
    console.error("❌ Error al crear cita:", error);
    res.status(500).json({ message: "Error al crear cita", error: error.message });
  }
};
/*
export const actualizarCita = async (req, res) => {
  try {
    const { id } = req.params;
    await updateAppointment(id, req.body);
    
    // Retornar la cita actualizada
    const citas = await getAllAppointments();
    const citaActualizada = citas.find(c => c.id === parseInt(id));
    
    res.json(citaActualizada || { mensaje: "Cita actualizada correctamente" });
  } catch (error) {
    console.error("Error al actualizar cita:", error);
    res.status(500).json({ error: "Error al actualizar la cita" });
  }
};
*/
/*
export const actualizarCita = async (req, res) => {
  try {
    console.log("📦 Datos recibidos para actualizar cita:", req.params, req.body);

    const { id } = req.params;
    const cita = req.body;

    const result = await updateAppointment(id, cita);
    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Error al actualizar cita:", error);
    res.status(500).json({ message: "Error al actualizar cita", error: error.message });
  }
};
*/

export const actualizarCita = async (req, res) => {
  try {
    console.log("📦 Params:", req.params);
    console.log("📦 Body recibido:", JSON.stringify(req.body, null, 2));

    const { id } = req.params;
    const cita = req.body;

    // Valida campos obligatorios antes de continuar
    if (!cita.idCliente || !cita.idMascota || !cita.idVet || !cita.idStatus || !cita.time) {
      return res.status(400).json({ message: "Faltan datos obligatorios para actualizar la cita", data: cita });
    }

    const result = await updateAppointment(id, cita);
    res.status(200).json(result);
	
  } catch (error) {
    console.error("❌ Error al actualizar cita:", error);
    res.status(500).json({ message: "Error al actualizar cita", error: error.message });
  }
};

export const eliminarCita = async (req, res) => {
  try {
    const { id } = req.params;
	 console.log("🧠 ID recibido para eliminar:", id);
    await deleteAppointment(id);
    res.json({ mensaje: "Cita eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar cita:", error);
    res.status(500).json({ error: "Error al eliminar la cita" });
  }
};