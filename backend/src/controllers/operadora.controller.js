import {
  getAllOperadoras,
  getOperadoraById,
  createOperadora,
  updateOperadora,
  deleteOperadora,
} from "../models/operadora.model.js";

export const obtenerOperadoras = async (req, res) => {
  try {
    const data = await getAllOperadoras();
    res.json(data);
  } catch (error) {
    console.error("Error fetching operadora:", error);
    res.status(500).json({ error: "Error al obtener operadora" });
  }
};

export const obtenerOperadora = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await getOperadoraById(id);
    if (!item) {
      return res.status(404).json({ error: "No encontrado" });
    }
    res.json(item);
  } catch (error) {
    console.error("Error fetching operadora:", error);
    res.status(500).json({ error: "Error al obtener operadora" });
  }
};

export const crearOperadora = async (req, res) => {
  try {
    const result = await createOperadora(req.body);
    res.json(result);
  } catch (error) {
    console.error("Error creating operadora:", error);
    res.status(500).json({
      error: `Error al crear operadora: ${error.message || ""}`.trim(),
    });
  }
};

export const actualizarOperadora = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateOperadora(id, req.body);
    res.json(result);
  } catch (error) {
    console.error("Error updating operadora:", error);
    res.status(500).json({
      error: `Error al actualizar operadora: ${error.message || ""}`.trim(),
    });
  }
};

export const eliminarOperadora = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteOperadora(id);
    res.json({ message: "Eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting operadora:", error);
    res.status(500).json({ error: "Error al eliminar operadora" });
  }
};

