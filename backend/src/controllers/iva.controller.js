import {
  getAllIVAs,
  getIVAById,
  createIVA,
  updateIVA,
  deleteIVA,
} from "../models/iva.model.js";

export const obtenerIVAs = async (req, res) => {
  try {
    const data = await getAllIVAs();
    res.json(data);
  } catch (error) {
    console.error("Error fetching IVA:", error);
    res.status(500).json({ error: "Error al obtener IVA" });
  }
};

export const obtenerIVA = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await getIVAById(id);
    if (!item) {
      return res.status(404).json({ error: "No encontrado" });
    }
    res.json(item);
  } catch (error) {
    console.error("Error fetching IVA:", error);
    res.status(500).json({ error: "Error al obtener IVA" });
  }
};

export const crearIVA = async (req, res) => {
  try {
    const result = await createIVA(req.body);
    res.json(result);
  } catch (error) {
    console.error("Error creating IVA:", error);
    res.status(500).json({
      error: `Error al crear IVA: ${error.message || ""}`.trim(),
    });
  }
};

export const actualizarIVA = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateIVA(id, req.body);
    res.json(result);
  } catch (error) {
    console.error("Error updating IVA:", error);
    res.status(500).json({
      error: `Error al actualizar IVA: ${error.message || ""}`.trim(),
    });
  }
};

export const eliminarIVA = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteIVA(id);
    res.json({ message: "Eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting IVA:", error);
    res.status(500).json({ error: "Error al eliminar IVA" });
  }
};
