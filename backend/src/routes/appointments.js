import express from "express";
import { query } from "../config/database.js";

export const appointmentsRouter = express.Router();

// ===== OBTENER TODAS LAS CITAS =====
appointmentsRouter.get("/appointments", async (req, res) => {
  try {
    const sql = `
      SELECT 
        c.id_cita as id,
        c.fecha_hora_cita as time,
        cl.nombre as clientName,
        m.nombre as petName,
        m.especie as petType,
        c.motivo as reason,
        c.observaciones,
        v.nombre as veterinarian,
        ec.nombre_estado as status,
        ec.id_estado_cita as statusId
      FROM CYA_Reserva_Cita c
      JOIN Cliente cl ON c.id_cliente = cl.id_cliente
      JOIN Mascota m ON c.id_mascota = m.id_mascota
      JOIN Veterinario v ON c.id_veterinario = v.id_veterinario
      JOIN CYA_Estado_Cita ec ON c.id_estado_cita = ec.id_estado_cita
      ORDER BY c.fecha_hora_cita DESC
    `;
    
    const citas = await query(sql);
    res.json(citas);
  } catch (error) {
    console.error("Error al obtener citas:", error);
    res.status(500).json({ error: "Error al obtener las citas" });
  }
});

// ===== CREAR UNA NUEVA CITA =====
appointmentsRouter.post("/appointments", async (req, res) => {
  try {
    const { 
      clientName, 
      petName, 
      veterinarianId, 
      time, 
      reason, 
      observaciones = '',
      statusId = 1  // Por defecto estado "Pendiente" (asume que existe)
    } = req.body;

    // Obtener el ID del módulo de Citas y Agendas
    const modulo = await query(
      "SELECT id_modulo_general_audit FROM ModuloGeneralAudit WHERE nombre_modulo = 'Citas y Agendas' LIMIT 1"
    );
    
    if (modulo.length === 0) {
      return res.status(500).json({ error: "Módulo de Citas y Agendas no encontrado" });
    }
    
    const moduloId = modulo[0].id_modulo_general_audit;

    // Buscar o crear cliente
    let cliente = await query(
      "SELECT id_cliente FROM Cliente WHERE nombre = ?",
      [clientName]
    );

    if (cliente.length === 0) {
      const result = await query(
        "INSERT INTO Cliente (nombre, telefono, email) VALUES (?, '', '')",
        [clientName]
      );
      cliente = [{ id_cliente: result.insertId }];
    }

    const clienteId = cliente[0].id_cliente;

    // Buscar o crear mascota
    let mascota = await query(
      "SELECT id_mascota FROM Mascota WHERE nombre = ? AND id_cliente = ?",
      [petName, clienteId]
    );

    if (mascota.length === 0) {
      const result = await query(
        "INSERT INTO Mascota (nombre, especie, id_cliente) VALUES (?, 'Perro', ?)",
        [petName, clienteId]
      );
      mascota = [{ id_mascota: result.insertId }];
    }

    const mascotaId = mascota[0].id_mascota;

    // Crear la cita
    const resultCita = await query(
      `INSERT INTO CYA_Reserva_Cita 
       (id_cliente, id_mascota, id_veterinario, id_estado_cita, modulo_origen, fecha_hora_cita, motivo, observaciones) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [clienteId, mascotaId, veterinarianId, statusId, moduloId, time, reason, observaciones]
    );

    // Obtener la cita completa recién creada
    const nuevaCita = await query(
      `SELECT 
        c.id_cita as id,
        c.fecha_hora_cita as time,
        cl.nombre as clientName,
        m.nombre as petName,
        m.especie as petType,
        c.motivo as reason,
        c.observaciones,
        v.nombre as veterinarian,
        ec.nombre_estado as status,
        ec.id_estado_cita as statusId
      FROM CYA_Reserva_Cita c
      JOIN Cliente cl ON c.id_cliente = cl.id_cliente
      JOIN Mascota m ON c.id_mascota = m.id_mascota
      JOIN Veterinario v ON c.id_veterinario = v.id_veterinario
      JOIN CYA_Estado_Cita ec ON c.id_estado_cita = ec.id_estado_cita
      WHERE c.id_cita = ?`,
      [resultCita.insertId]
    );

    // Crear notificación para el cliente
    await query(
      `INSERT INTO CYA_Notificacion 
       (id_cita, modulo_origen, tipo_destinatario, mensaje, estado_envio) 
       VALUES (?, ?, 'Cliente', ?, 'Pendiente')`,
      [
        resultCita.insertId, 
        moduloId, 
        `Su cita para ${petName} ha sido agendada para el ${time}`
      ]
    );

    // Crear notificación para el veterinario
    await query(
      `INSERT INTO CYA_Notificacion 
       (id_cita, modulo_origen, tipo_destinatario, mensaje, estado_envio) 
       VALUES (?, ?, 'Veterinario', ?, 'Pendiente')`,
      [
        resultCita.insertId, 
        moduloId, 
        `Nueva cita agendada: ${clientName} con ${petName} - ${time}`
      ]
    );

    res.status(201).json(nuevaCita[0]);
  } catch (error) {
    console.error("Error al crear cita:", error);
    res.status(500).json({ error: "Error al crear la cita" });
  }
});

// ===== ACTUALIZAR UNA CITA =====
appointmentsRouter.put("/appointments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { time, veterinarianId, statusId, observaciones } = req.body;

    // Construir query dinámico según los campos que se envíen
    let updateFields = [];
    let updateValues = [];

    if (time) {
      updateFields.push("fecha_hora_cita = ?");
      updateValues.push(time);
    }
    if (veterinarianId) {
      updateFields.push("id_veterinario = ?");
      updateValues.push(veterinarianId);
    }
    if (statusId) {
      updateFields.push("id_estado_cita = ?");
      updateValues.push(statusId);
    }
    if (observaciones !== undefined) {
      updateFields.push("observaciones = ?");
      updateValues.push(observaciones);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: "No hay campos para actualizar" });
    }

    updateValues.push(id);

    await query(
      `UPDATE CYA_Reserva_Cita SET ${updateFields.join(", ")} WHERE id_cita = ?`,
      updateValues
    );

    // Obtener la cita actualizada
    const citaActualizada = await query(
      `SELECT 
        c.id_cita as id,
        c.fecha_hora_cita as time,
        cl.nombre as clientName,
        m.nombre as petName,
        m.especie as petType,
        c.motivo as reason,
        c.observaciones,
        v.nombre as veterinarian,
        ec.nombre_estado as status,
        ec.id_estado_cita as statusId
      FROM CYA_Reserva_Cita c
      JOIN Cliente cl ON c.id_cliente = cl.id_cliente
      JOIN Mascota m ON c.id_mascota = m.id_mascota
      JOIN Veterinario v ON c.id_veterinario = v.id_veterinario
      JOIN CYA_Estado_Cita ec ON c.id_estado_cita = ec.id_estado_cita
      WHERE c.id_cita = ?`,
      [id]
    );

    // Crear notificación de cambio
    const modulo = await query(
      "SELECT id_modulo_general_audit FROM ModuloGeneralAudit WHERE nombre_modulo = 'Citas y Agendas' LIMIT 1"
    );
    
    if (modulo.length > 0) {
      await query(
        `INSERT INTO CYA_Notificacion 
         (id_cita, modulo_origen, tipo_destinatario, mensaje, estado_envio) 
         VALUES (?, ?, 'Cliente', ?, 'Pendiente')`,
        [id, modulo[0].id_modulo_general_audit, `Su cita ha sido modificada`]
      );
    }

    res.json(citaActualizada[0]);
  } catch (error) {
    console.error("Error al actualizar cita:", error);
    res.status(500).json({ error: "Error al actualizar la cita" });
  }
});

// ===== ELIMINAR UNA CITA =====
appointmentsRouter.delete("/appointments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Las notificaciones se eliminan automáticamente por CASCADE
    await query("DELETE FROM CYA_Reserva_Cita WHERE id_cita = ?", [id]);
    
    res.json({ message: "Cita eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar cita:", error);
    res.status(500).json({ error: "Error al eliminar la cita" });
  }
});

// ===== OBTENER ESTADOS DE CITA =====
appointmentsRouter.get("/appointment-states", async (req, res) => {
  try {
    const estados = await query(
      `SELECT 
        id_estado_cita as id, 
        nombre_estado as name,
        descripcion
      FROM CYA_Estado_Cita 
      ORDER BY id_estado_cita`
    );
    res.json(estados);
  } catch (error) {
    console.error("Error al obtener estados:", error);
    res.status(500).json({ error: "Error al obtener estados de cita" });
  }
});

// ===== OBTENER TODOS LOS VETERINARIOS =====
appointmentsRouter.get("/veterinarians", async (req, res) => {
  try {
    const veterinarios = await query(
      `SELECT 
        id_veterinario as id, 
        nombre as name,
        especialidad
      FROM Veterinario 
      ORDER BY nombre`
    );
    res.json(veterinarios);
  } catch (error) {
    console.error("Error al obtener veterinarios:", error);
    res.status(500).json({ error: "Error al obtener veterinarios" });
  }
});

// ===== OBTENER AGENDA DE UN VETERINARIO =====
appointmentsRouter.get("/veterinarians/:id/schedule", async (req, res) => {
  try {
    const { id } = req.params;
    
    const agenda = await query(
      `SELECT 
        id_calendario as id,
        dia_semana as day,
        hora_inicio as start,
        hora_fin as end,
        turno as shift
      FROM CYA_Calendario_Trabajo 
      WHERE id_veterinario = ?
      ORDER BY FIELD(dia_semana, 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo')`,
      [id]
    );
    
    res.json(agenda);
  } catch (error) {
    console.error("Error al obtener agenda:", error);
    res.status(500).json({ error: "Error al obtener la agenda" });
  }
});

// ===== OBTENER NOTIFICACIONES DE UNA CITA =====
appointmentsRouter.get("/appointments/:id/notifications", async (req, res) => {
  try {
    const { id } = req.params;
    
    const notificaciones = await query(
      `SELECT 
        id_notificacion as id,
        tipo_destinatario as recipient,
        mensaje as message,
        fecha_hora_envio as timestamp,
        estado_envio as status
      FROM CYA_Notificacion 
      WHERE id_cita = ?
      ORDER BY fecha_hora_envio DESC`,
      [id]
    );
    
    res.json(notificaciones);
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    res.status(500).json({ error: "Error al obtener notificaciones" });
  }
});