import {
  getAllEstadoGeneral,
  getEstadoGeneralById,
  createEstadoGeneral,
  updateEstadoGeneral,
  deleteEstadoGeneral,
} from "../models/estado-general.model.js";

export const obtenerEstadosGenerales = async (req, res) => {
  try {
    const data = await getAllEstadoGeneral();
    res.json(data);
  } catch (error) {
    console.error("Error fetching estado general:", error);
    res.status(500).json({ error: "Error al obtener estado general" });
  }
};

export const obtenerEstadoGeneral = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await getEstadoGeneralById(id);
    if (!item) {
      return res.status(404).json({ error: "No encontrado" });
    }
    res.json(item);
  } catch (error) {
    console.error("Error fetching estado general:", error);
    res.status(500).json({ error: "Error al obtener estado general" });
  }
};

export const crearEstadoGeneral = async (req, res) => {
  try {
    const result = await createEstadoGeneral(req.body);
    res.json(result);
  } catch (error) {
    console.error("Error creating estado general:", error);
    res.status(500).json({
      error: `Error al crear estado general: ${error.message || ""}`.trim(),
    });
  }
};

export const actualizarEstadoGeneral = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateEstadoGeneral(id, req.body);
    res.json(result);
  } catch (error) {
    console.error("Error updating estado general:", error);
    res.status(500).json({
      error: `Error al actualizar estado general: ${error.message || ""}`.trim(),
    });
  }
};

export const eliminarEstadoGeneral = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteEstadoGeneral(id);
    res.json({ message: "Eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting estado general:", error);
    res.status(500).json({ error: "Error al eliminar estado general" });
  }
};

