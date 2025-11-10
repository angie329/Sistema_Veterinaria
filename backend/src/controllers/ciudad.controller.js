import {
  getAllCiudades,
  getCiudadById,
  createCiudad,
  updateCiudad,
  deleteCiudad,
} from "../models/ciudad.model.js";

export const obtenerCiudades = async (req, res) => {
  try {
    const data = await getAllCiudades();
    res.json(data);
  } catch (error) {
    console.error("Error fetching ciudad:", error);
    res.status(500).json({ error: "Error al obtener ciudad" });
  }
};

export const obtenerCiudad = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await getCiudadById(id);
    if (!item) {
      return res.status(404).json({ error: "No encontrado" });
    }
    res.json(item);
  } catch (error) {
    console.error("Error fetching ciudad:", error);
    res.status(500).json({ error: "Error al obtener ciudad" });
  }
};

export const crearCiudad = async (req, res) => {
  try {
    const result = await createCiudad(req.body);
    res.json(result);
  } catch (error) {
    console.error("Error creating ciudad:", error);
    res.status(500).json({
      error: `Error al crear ciudad: ${error.message || ""}`.trim(),
    });
  }
};

export const actualizarCiudad = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateCiudad(id, req.body);
    res.json(result);
  } catch (error) {
    console.error("Error updating ciudad:", error);
    res.status(500).json({
      error: `Error al actualizar ciudad: ${error.message || ""}`.trim(),
    });
  }
};

export const eliminarCiudad = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteCiudad(id);
    res.json({ message: "Eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting ciudad:", error);
    res.status(500).json({ error: "Error al eliminar ciudad" });
  }
};
