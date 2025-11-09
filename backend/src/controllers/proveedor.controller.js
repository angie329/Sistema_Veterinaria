import {
  getAllProveedores,
  getProveedorById,
  createProveedor,
  updateProveedor,
  deleteProveedor,
} from "../models/proveedor.model.js";

export const obtenerProveedores = async (req, res) => {
  try {
    const rows = await getAllProveedores();
    res.json(rows);
  } catch (error) {
    console.error("Error fetching proveedores:", error);
    res.status(500).json({ error: "Error al obtener proveedores" });
  }
};

export const obtenerProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const proveedor = await getProveedorById(id);
    if (!proveedor) {
      return res.status(404).json({ error: "No encontrado" });
    }
    res.json(proveedor);
  } catch (error) {
    console.error("Error fetching proveedor:", error);
    res.status(500).json({ error: "Error al obtener proveedor" });
  }
};

export const crearProveedor = async (req, res) => {
  try {
    const result = await createProveedor(req.body);
    res.json(result);
  } catch (error) {
    console.error("Error creating proveedor:", error);
    res.status(500).json({
      error: `Error al crear proveedor: ${error.message || ""}`.trim(),
    });
  }
};

export const actualizarProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateProveedor(id, req.body);
    res.json(result);
  } catch (error) {
    console.error("Error updating proveedor:", error);
    res.status(500).json({
      error: `Error al actualizar proveedor: ${error.message || ""}`.trim(),
    });
  }
};

export const eliminarProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteProveedor(id);
    res.json({ message: "Eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting proveedor:", error);
    res.status(500).json({ error: "Error al eliminar proveedor" });
  }
};

