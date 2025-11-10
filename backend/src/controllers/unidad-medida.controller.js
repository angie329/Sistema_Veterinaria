import {
  getAllUnidadMedidas,
  getUnidadMedidaById,
  createUnidadMedida,
  updateUnidadMedida,
  deleteUnidadMedida,
} from "../models/unidad-medida.model.js";

export const obtenerUnidadMedidas = async (req, res) => {
  try {
    const data = await getAllUnidadMedidas();
    res.json(data);
  } catch (error) {
    console.error("Error fetching unidad medida:", error);
    res.status(500).json({ error: "Error al obtener unidad medida" });
  }
};

export const obtenerUnidadMedida = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await getUnidadMedidaById(id);
    if (!item) {
      return res.status(404).json({ error: "No encontrado" });
    }
    res.json(item);
  } catch (error) {
    console.error("Error fetching unidad medida:", error);
    res.status(500).json({ error: "Error al obtener unidad medida" });
  }
};

export const crearUnidadMedida = async (req, res) => {
  try {
    const result = await createUnidadMedida(req.body);
    res.json(result);
  } catch (error) {
    console.error("Error creating unidad medida:", error);
    res.status(500).json({
      error: `Error al crear unidad medida: ${error.message || ""}`.trim(),
    });
  }
};

export const actualizarUnidadMedida = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateUnidadMedida(id, req.body);
    res.json(result);
  } catch (error) {
    console.error("Error updating unidad medida:", error);
    res.status(500).json({
      error: `Error al actualizar unidad medida: ${error.message || ""}`.trim(),
    });
  }
};

export const eliminarUnidadMedida = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteUnidadMedida(id);
    res.json({ message: "Eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting unidad medida:", error);
    res.status(500).json({ error: "Error al eliminar unidad medida" });
  }
};
