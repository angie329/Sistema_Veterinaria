import { query } from "../config/database.js";

export const getReporteVeterinarios = async (req, res) => {
  try {
    const data = await query(`
      SELECT 
        v.id_Veterinario,
        v.Vet_Nombres,
        v.Vet_Apellidos,
        v.Vet_Telefono,
        v.Vet_Correo,
        e.Esp_Nombre AS Especialidad,
        v.Vet_Estado AS Estado,
        v.created_at,
        v.updated_at
      FROM vet_veterinarios v
      LEFT JOIN vet_especialidades e
        ON v.id_Especialidad_FK = e.id_Especialidad
      ORDER BY v.updated_at DESC;
    `);

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
