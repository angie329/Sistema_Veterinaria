// src/routes/mockData.js

export let appointments = [
  { 
    id: 1, time: "2025-11-10T10:00:00", reason: "Vacuna anual", observaciones: "",
    clientName: "Juan Pérez", petName: "Firulais", petType: "Perro",
    veterinarianId: 1, veterinarian: "Dr. Carlos Mendoza",
    statusId: 2, status: "Confirmada"
  },
  { 
    id: 2, time: "2025-11-11T15:00:00", reason: "Revisión general", observaciones: "",
    clientName: "María López", petName: "Milo", petType: "Gato",
    veterinarianId: 2, veterinarian: "Dra. Ana Martínez",
    statusId: 1, status: "Pendiente"
  }
];

export let notifications = [];

export const veterinarios = [
  { id: 1, name: "Dr. Carlos Mendoza", specialty: "Cirugía general" },
  { id: 2, name: "Dra. Ana Martínez", specialty: "Vacunación y medicina preventiva" },
  { id: 3, name: "Dr. Luis Herrera", specialty: "Odontología veterinaria" },
  { id: 4, name: "Dra. Laura Torres", specialty: "Dermatología" },
  { id: 5, name: "Dr. Roberto Silva", specialty: "Diagnóstico por imagen" },
];

export const estadosCita = [
  { id: 1, nombre: "Pendiente", descripcion: "Cita pendiente de confirmación" },
  { id: 2, nombre: "Confirmada", descripcion: "Cita confirmada por el cliente" },
  { id: 3, nombre: "Cancelada", descripcion: "Cita cancelada" },
  { id: 4, nombre: "Atendida", descripcion: "Cita realizada" },
];

export const agendas = {
  1: [ 
    { id: 1, dia_semana: "Lunes", hora_inicio: "08:00", hora_fin: "12:00", turno: "Mañana" },
    { id: 2, dia_semana: "Martes", hora_inicio: "14:00", hora_fin: "18:00", turno: "Tarde" },
  ],
  2: [ 
    { id: 1, dia_semana: "Lunes", hora_inicio: "08:00", hora_fin: "12:00", turno: "Mañana" },
    { id: 2, dia_semana: "Miércoles", hora_inicio: "14:00", hora_fin: "18:00", turno: "Tarde" },
  ],
};
