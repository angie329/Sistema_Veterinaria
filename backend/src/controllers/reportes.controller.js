import { getReporteVeterinariosData } from "../models/reporte.model.js";

export const getReporteVeterinarios = async (req, res) => {
  try {
    const data = await getReporteVeterinariosData();

    res.status(200).json({
      mensaje: "Reporte generado correctamente",
      total_registros: data.length,
      data,
    });
  } catch (error) {
    console.error("❌ Error al obtener reporte:", error);
    res.status(500).json({ error: "Error al generar el reporte" });
  }
};
