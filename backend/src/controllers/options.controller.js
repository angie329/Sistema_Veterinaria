import { query } from "../config/database.js";

/**
 * Obtiene todas las opciones necesarias para los formularios de productos.
 * Esto incluye tipos de artículo, unidades de medida e IVAs.
 */
export const getProductOptions = async (req, res) => {
    try {
        const sql = `
      SELECT 
          id_Inv_TipoArticulo AS id,
          Inv_Descripcion AS name,
          'tipoArticulo' AS tipo
      FROM Inv_TipoArticulo

      UNION ALL

      SELECT 
          Gen_id_unidad_medida AS id,
          Gen_nombre AS name,
          'unidadMedida' AS tipo
      FROM Gen_UnidadMedida
      

      UNION ALL

      SELECT 
          Gen_id_iva AS id,
          CONCAT(Gen_porcentaje, '%') AS name,
          'iva' AS tipo
      FROM Gen_Iva
      
    `;

        const options = await query(sql);

        const tiposArticulo = options.filter(o => o.tipo === 'tipoArticulo');
        const unidadesMedida = options.filter(o => o.tipo === 'unidadMedida');
        const ivas = options.filter(o => o.tipo === 'iva');

        res.json({ tiposArticulo, unidadesMedida, ivas });

    } catch (error) {
        console.error("Error fetching product options:", error);
        res.status(500).json({
            message: "Error al obtener las opciones para productos",
            error: error.message,
        });
    }
};


