import {
  getAllProvincias,
  getProvinciaById,
  createProvincia,
  updateProvincia,
  deleteProvincia,
} from "../models/provincia.model.js";

export const obtenerProvincias = async (req, res) => {
  try {
    const data = await getAllProvincias();
    res.json(data);
  } catch (error) {
    console.error("Error fetching provincia:", error);
    res.status(500).json({ error: "Error al obtener provincia" });
  }
};

export const obtenerProvincia = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await getProvinciaById(id);
    if (!item) {
      return res.status(404).json({ error: "No encontrado" });
    }
    res.json(item);
  } catch (error) {
    console.error("Error fetching provincia:", error);
    res.status(500).json({ error: "Error al obtener provincia" });
  }
};

export const crearProvincia = async (req, res) => {
  try {
    const result = await createProvincia(req.body);
    res.json(result);
  } catch (error) {
    console.error("Error creating provincia:", error);
    res.status(500).json({
      error: `Error al crear provincia: ${error.message || ""}`.trim(),
    });
  }
};

export const actualizarProvincia = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateProvincia(id, req.body);
    res.json(result);
  } catch (error) {
    console.error("Error updating provincia:", error);
    res.status(500).json({
      error: `Error al actualizar provincia: ${error.message || ""}`.trim(),
    });
  }
};

export const eliminarProvincia = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteProvincia(id);
    res.json({ message: "Eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting provincia:", error);
    res.status(500).json({ error: "Error al eliminar provincia" });
  }
};

