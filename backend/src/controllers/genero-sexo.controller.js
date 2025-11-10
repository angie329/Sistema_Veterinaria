import {
  getAllGeneroSexos,
  getGeneroSexoById,
  createGeneroSexo,
  updateGeneroSexo,
  deleteGeneroSexo,
} from "../models/genero-sexo.model.js";

export const obtenerGeneroSexos = async (req, res) => {
  try {
    const data = await getAllGeneroSexos();
    res.json(data);
  } catch (error) {
    console.error("Error fetching género/sexo:", error);
    res.status(500).json({ error: "Error al obtener género/sexo" });
  }
};

export const obtenerGeneroSexo = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await getGeneroSexoById(id);
    if (!item) {
      return res.status(404).json({ error: "No encontrado" });
    }
    res.json(item);
  } catch (error) {
    console.error("Error fetching género/sexo:", error);
    res.status(500).json({ error: "Error al obtener género/sexo" });
  }
};

export const crearGeneroSexo = async (req, res) => {
  try {
    const result = await createGeneroSexo(req.body);
    res.json(result);
  } catch (error) {
    console.error("Error creating género/sexo:", error);
    res.status(500).json({
      error: `Error al crear género/sexo: ${error.message || ""}`.trim(),
    });
  }
};

export const actualizarGeneroSexo = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateGeneroSexo(id, req.body);
    res.json(result);
  } catch (error) {
    console.error("Error updating género/sexo:", error);
    res.status(500).json({
      error: `Error al actualizar género/sexo: ${error.message || ""}`.trim(),
    });
  }
};

export const eliminarGeneroSexo = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteGeneroSexo(id);
    res.json({ message: "Eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting género/sexo:", error);
    res.status(500).json({ error: "Error al eliminar género/sexo" });
  }
};

