import {getAllTurnos } from "../../models/veterinarios/turno.model.js";

export const obtenerTurnosPorVeterinario = async (req, res) => {
  try {
    const { id } = req.params;
    const turnos = await getAllTurnos(id);
    res.json(turnos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener turnos", error });
  }
};
