import {
  getAllTipoDocumentos,
  getTipoDocumentoById,
  createTipoDocumento,
  updateTipoDocumento,
  deleteTipoDocumento,
} from "../models/tipo-documento.model.js";

export const obtenerTipoDocumentos = async (req, res) => {
  try {
    const data = await getAllTipoDocumentos();
    res.json(data);
  } catch (error) {
    console.error("Error fetching tipo documento:", error);
    res.status(500).json({ error: "Error al obtener tipo documento" });
  }
};

export const obtenerTipoDocumento = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await getTipoDocumentoById(id);
    if (!item) {
      return res.status(404).json({ error: "No encontrado" });
    }
    res.json(item);
  } catch (error) {
    console.error("Error fetching tipo documento:", error);
    res.status(500).json({ error: "Error al obtener tipo documento" });
  }
};

export const crearTipoDocumento = async (req, res) => {
  try {
    const result = await createTipoDocumento(req.body);
    res.json(result);
  } catch (error) {
    console.error("Error creating tipo documento:", error);
    res.status(500).json({
      error: `Error al crear tipo documento: ${error.message || ""}`.trim(),
    });
  }
};

export const actualizarTipoDocumento = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateTipoDocumento(id, req.body);
    res.json(result);
  } catch (error) {
    console.error("Error updating tipo documento:", error);
    res.status(500).json({
      error: `Error al actualizar tipo documento: ${error.message || ""}`.trim(),
    });
  }
};

export const eliminarTipoDocumento = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteTipoDocumento(id);
    res.json({ message: "Eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting tipo documento:", error);
    res.status(500).json({ error: "Error al eliminar tipo documento" });
  }
};

