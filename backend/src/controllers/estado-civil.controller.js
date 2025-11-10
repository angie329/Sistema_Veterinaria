import {
  getAllEstadoCiviles,
  getEstadoCivilById,
  createEstadoCivil,
  updateEstadoCivil,
  deleteEstadoCivil,
} from "../models/estado-civil.model.js";

export const obtenerEstadoCiviles = async (req, res) => {
  try {
    const data = await getAllEstadoCiviles();
    res.json(data);
  } catch (error) {
    console.error("Error fetching estado civil:", error);
    res.status(500).json({ error: "Error al obtener estado civil" });
  }
};

export const obtenerEstadoCivil = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await getEstadoCivilById(id);
    if (!item) {
      return res.status(404).json({ error: "No encontrado" });
    }
    res.json(item);
  } catch (error) {
    console.error("Error fetching estado civil:", error);
    res.status(500).json({ error: "Error al obtener estado civil" });
  }
};

export const crearEstadoCivil = async (req, res) => {
  try {
    const result = await createEstadoCivil(req.body);
    res.json(result);
  } catch (error) {
    console.error("Error creating estado civil:", error);
    res.status(500).json({
      error: `Error al crear estado civil: ${error.message || ""}`.trim(),
    });
  }
};

export const actualizarEstadoCivil = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateEstadoCivil(id, req.body);
    res.json(result);
  } catch (error) {
    console.error("Error updating estado civil:", error);
    res.status(500).json({
      error: `Error al actualizar estado civil: ${error.message || ""}`.trim(),
    });
  }
};

export const eliminarEstadoCivil = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteEstadoCivil(id);
    res.json({ message: "Eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting estado civil:", error);
    res.status(500).json({ error: "Error al eliminar estado civil" });
  }
};
