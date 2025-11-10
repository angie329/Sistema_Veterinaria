import {
  getAllMetodoPagos,
  getMetodoPagoById,
  createMetodoPago,
  updateMetodoPago,
  deleteMetodoPago,
} from "../models/metodo-pago.model.js";

export const obtenerMetodoPagos = async (req, res) => {
  try {
    const data = await getAllMetodoPagos();
    res.json(data);
  } catch (error) {
    console.error("Error fetching método pago:", error);
    res.status(500).json({ error: "Error al obtener método pago" });
  }
};

export const obtenerMetodoPago = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await getMetodoPagoById(id);
    if (!item) {
      return res.status(404).json({ error: "No encontrado" });
    }
    res.json(item);
  } catch (error) {
    console.error("Error fetching método pago:", error);
    res.status(500).json({ error: "Error al obtener método pago" });
  }
};

export const crearMetodoPago = async (req, res) => {
  try {
    const result = await createMetodoPago(req.body);
    res.json(result);
  } catch (error) {
    console.error("Error creating método pago:", error);
    res.status(500).json({
      error: `Error al crear método pago: ${error.message || ""}`.trim(),
    });
  }
};

export const actualizarMetodoPago = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateMetodoPago(id, req.body);
    res.json(result);
  } catch (error) {
    console.error("Error updating método pago:", error);
    res.status(500).json({
      error: `Error al actualizar método pago: ${error.message || ""}`.trim(),
    });
  }
};

export const eliminarMetodoPago = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteMetodoPago(id);
    res.json({ message: "Eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting método pago:", error);
    res.status(500).json({ error: "Error al eliminar método pago" });
  }
};

