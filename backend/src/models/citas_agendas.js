import { query } from "../config/database.js";

// ========== VETERINARIOS ==========
export const getAllVeterinarians = async () => {
  return await query(`
    SELECT 
      id_Veterinario AS id,
      CONCAT(Vet_Nombres, ' ', Vet_Apellidos) AS name,
      id_Especialidad_FK AS specialty,
      Vet_Telefono AS phone,
      Vet_Correo AS email
    FROM vet_veterinarios
    ORDER BY Vet_Apellidos, Vet_Nombres
  `);
};

// ========== ESTADOS DE CITA ==========
export const getAllAppointmentStates = async () => {
  return await query(`
    SELECT 
      id_estado_cita AS id,
      nombre_estado AS nombre,
      descripcion
    FROM cya_estado_cita
    ORDER BY id_estado_cita
  `);
};

// ========== AGENDA/CALENDARIO DE VETERINARIO ==========
export const getVeterinarianSchedule = async (veterinarianId) => {
  return await query(`
    SELECT 
      dia_semana AS day,
      TIME_FORMAT(hora_inicio, '%H:%i') AS start,
      TIME_FORMAT(hora_fin, '%H:%i') AS end,
      turno AS shift
    FROM cya_calendario_trabajo
    WHERE id_Veterinario = ?
    ORDER BY 
      FIELD(dia_semana, 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo')
  `, [veterinarianId]);
};

// ========== CITAS ==========
export const getAllAppointments = async () => {
  return await query(`
    SELECT 
  c.id_cita AS id,
  c.id_cliente AS clientId,
  c.id_mascota AS petId,
  CONCAT(cl.Cli_Nombres, ' ', cl.Cli_Apellidos) AS clientName,
  m.mas_nombre AS petName,
  m.mas_id_tipo_mascota_fk AS petType,
  CONCAT(v.Vet_Nombres, ' ', v.Vet_Apellidos) AS veterinarian,
  v.id_Veterinario AS veterinarianId,
  c.fecha_hora_cita AS time,
  c.motivo AS reason,
  c.observaciones,
  e.nombre_estado AS status,
  e.id_estado_cita AS statusId
FROM cya_reserva_cita c
LEFT JOIN clientes cl ON c.id_cliente = cl.id_Clientes
LEFT JOIN mas_mascota m ON c.id_mascota = m.mas_id_mascota
LEFT JOIN vet_veterinarios v ON c.id_veterinario = v.id_Veterinario
LEFT JOIN cya_estado_cita e ON c.id_estado_cita = e.id_estado_cita
ORDER BY c.fecha_hora_cita DESC
  `);
};

// Crear cita usando clientes y mascotas existentes
export const createAppointment = async (data) => {
	
  const {
    clientId,
	petId,
    veterinarianId,
    time,
    reason,
    observaciones = "",
    statusId = 2
  } = data;

const idCliente = Number(clientId);
const idMascota = Number(petId);
const idVet = Number(veterinarianId);
const idStatus = Number(statusId);

// Validar que no sean NaN
if (isNaN(idCliente) || isNaN(idMascota) || isNaN(idVet) || isNaN(idStatus)) {
    throw new Error("ID de cliente, mascota, veterinario o estado inválido");
}

// Validar que time sea una cadena (string)
if (typeof time !== "string") {
    throw new Error("La fecha y hora deben ser un string válido");
}
  // Verificar que el cliente exista
  const clientRows = await query(
    `SELECT id_Clientes FROM clientes WHERE id_Clientes = ?`,
    [clientId]
  );
  if (!clientRows || clientRows.length === 0) {
    throw new Error("Cliente no encontrado");
  }


    // 3️⃣ Depuración (opcional, solo para ver qué se envía a MySQL)
    console.log("Verificando cliente y mascota", { idCliente, idMascota });
  let petRows = await query(
  `SELECT mas_id_mascota FROM mas_mascota WHERE mas_id_mascota = ? AND mas_id_cliente_fk = ?`,
  [petId, clientId]
);

if (!petRows || petRows.length === 0) {
  throw new Error("Mascota no encontrada para este cliente");
}
console.log("Insertando cita con estos valores:", {
  idCliente, idMascota, idVet, idStatus, time, reason, observaciones
});

  // Insertar la cita
  const result = await query(
    `INSERT INTO CYA_Reserva_Cita 
     (id_cliente, id_mascota, id_veterinario, id_estado_cita, modulo_origen, fecha_hora_cita, motivo, observaciones)
     VALUES (?, ?, ?, ?, 1, ?, ?, ?)`,
    [idCliente, idMascota, idVet, idStatus, time, reason, observaciones]
  );

  return result.insertId;
};


// Actualizar cita existente
export const updateAppointment = async (id, data) => {
    const  {idCliente, idMascota, idVet, idStatus = 2, time, reason, observaciones, modulo_origen=1 }  = data;

  if (!idCliente || !idMascota || !idVet || !time) {
    throw new Error("Faltan datos obligatorios para crear la cita");
  }

  const result = await query(
     `
    UPDATE cya_reserva_cita
    SET 
      id_cliente = ?,
      id_mascota = ?,
      id_veterinario = ?,
      id_estado_cita = ?,
      fecha_hora_cita = ?,
      motivo = ?,
      observaciones = ?,
	  modulo_origen = ?
    WHERE id_cita = ?
    `,
    [idCliente, idMascota, idVet, idStatus, time, reason, observaciones,modulo_origen, id]
  )
   return result.affectedRows;
};

// Eliminar cita existente
export const deleteAppointment = async (id) => {
  await query(`DELETE FROM CYA_Reserva_Cita WHERE id_cita = ?`, [id]);
};
