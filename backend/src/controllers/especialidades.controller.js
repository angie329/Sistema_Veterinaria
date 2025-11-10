import {getAllEspecialidades, createEspecialidad} from "../models/especialidad.model.js";

export const obtenerEspecialidades = async (req, res) => {
  const data = await getAllEspecialidades();
  res.json(data);
};

export const agregarEspecialidades = async (req, res) => {
  try {
    await createEspecialidad(req.body);
    res.status(201).json({ mensaje: "Especialidad agregado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al insertar el Especialidad" });
  }
};

