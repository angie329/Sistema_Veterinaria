import { query } from "../../config/database.js";
import { getAllVeterinarios, createVeterinario, deleteVeterinario , updateVeterinario} from "../../models/veterinarios/veterinario.model.js";

export const obtenerVeterinarios = async (req, res) => {
  const data = await getAllVeterinarios();
  res.json(data);
};

export const agregarVeterinario = async (req, res) => {
  try {
    await createVeterinario(req.body);
    res.status(201).json({ mensaje: "Veterinario agregado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al insertar el veterinario" });
  }
};

export const eliminarVeterinario = async (req, res) => {
  const { id } = req.params;
  await deleteVeterinario(id);
  res.json({ mensaje: "Veterinario eliminado correctamente" });
};


export const editarVeterinario = async (req, res) => {
  const { id } = req.params;
  try {
    await updateVeterinario(id, req.body);
    res.json({ mensaje: " Veterinario actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el veterinario" });
  }
};
