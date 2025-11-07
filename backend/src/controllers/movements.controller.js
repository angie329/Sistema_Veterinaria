import { query } from "../config/database.js";

// Obtiene todos los movimientos con paginación y búsqueda
export const getMovements = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const searchTerm = req.query.search || "";

        const offset = (page - 1) * limit;
        const searchPattern = `%${searchTerm}%`;

        // Contar el total de movimientos que coinciden con la búsqueda
        const countResult = await query(
            `SELECT COUNT(*) as total 
             FROM Inv_Movimiento m
             JOIN Inv_Articulo a ON m.id_Inv_ArticuloFk = a.id_Inv_Articulo
             WHERE a.Inv_Nombre LIKE ?`,
            [searchPattern]
        );

        const totalMovements = countResult[0].total;
        const totalPages = Math.ceil(totalMovements / limit);

        console.log("Limite");
        console.log(limit);


        // Obtener los movimientos con la información extendida
        const movements = await query(
            `SELECT 
            m.id_Inv_Movimiento,
            m.Inv_Fecha,
            a.Inv_Nombre AS ProductoNombre,
            t.Inv_Descripcion AS TipoArticulo,
            u.Gen_nombre AS UnidadMedida,
            u.Gen_codigo AS CodigoUnidad,
            iva.Gen_porcentaje AS IVA,
            m.Inv_TipoMovimiento,
            m.Inv_Cantidad
            FROM Inv_Movimiento m
            JOIN Inv_Articulo a ON m.id_Inv_ArticuloFk = a.id_Inv_Articulo
            LEFT JOIN Inv_TipoArticulo t ON a.id_Inv_TipoArticuloFk = t.id_Inv_TipoArticulo
            LEFT JOIN Gen_UnidadMedida u ON a.id_Gen_UnidadMedidaFk = u.Gen_id_unidad_medida
            LEFT JOIN Gen_IVA iva ON a.id_Gen_IVAFk = iva.Gen_id_iva
            WHERE a.Inv_Nombre LIKE ?
            ORDER BY m.Inv_Fecha DESC
            LIMIT ${limit} OFFSET ${offset}`,
            [searchPattern]
        );

        // Formatear la fecha para presentación
        const formattedMovements = movements.map((mov) => ({
            ...mov,
            Inv_Fecha: new Date(mov.Inv_Fecha).toLocaleDateString("es-ES"),
        }));

        res.json({
            movements: formattedMovements,
            totalPages,
            currentPage: page,
        });
    } catch (error) {
        console.error("Error fetching movements:", error);
        res.status(500).json({
            message: "Error al obtener los movimientos",
            error: error.message,
        });
    }
};

// Obtiene un movimiento por su ID y las opciones para el formulario
export const getMovementById = async (req, res) => {
    try {
        const { id } = req.params;

        // Obtener datos del movimiento
        const movementSql = `
            SELECT 
                id_Inv_Movimiento as id,
                DATE_FORMAT(Inv_Fecha, '%Y-%m-%d') as fecha,
                id_Inv_ArticuloFk as producto,
                id_Inv_TipoMovimientoFk as tipo,
                Inv_Cantidad as cantidad
            FROM Inv_Movimiento 
            WHERE id_Inv_Movimiento = ?`;
        const [movement] = await query(movementSql, [id]);

        if (!movement) {
            return res.status(404).json({ message: "Movimiento no encontrado" });
        }

        // Obtener listas de opciones (productos y tipos de movimiento)
        const products = await query("SELECT id_Inv_Articulo as id, Inv_Nombre as name FROM Inv_Articulo WHERE Inv_EsActivo = 1 ORDER BY Inv_Nombre");
        const movementTypes = await query("SELECT id_Inv_TipoMovimiento as id, Inv_TipoMovimiento as name FROM Inv_TipoMovimiento");

        res.json({
            movement,
            options: {
                products,
                movementTypes
            }
        });

    } catch (error) {
        console.error(`Error fetching movement with id ${req.params.id}:`, error);
        res.status(500).json({ message: "Error al obtener el movimiento", error: error.message });
    }
};

// Actualiza un movimiento existente
export const updateMovement = async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha, producto, tipo, cantidad } = req.body;

        if (!fecha || !producto || !tipo || !cantidad) {
            return res.status(400).json({ message: "Faltan campos obligatorios." });
        }

        const sql = `
            UPDATE Inv_Movimiento SET
                Inv_Fecha = ?, 
                id_Inv_ArticuloFk = ?, 
                id_Inv_TipoMovimientoFk = ?, 
                Inv_Cantidad = ?
            WHERE id_Inv_Movimiento = ?
        `;
        await query(sql, [fecha, producto, tipo, cantidad, id]);

        res.json({ message: "Movimiento actualizado exitosamente" });
    } catch (error) {
        console.error(`Error updating movement with id ${req.params.id}:`, error);
        res.status(500).json({ message: "Error al actualizar el movimiento", error: error.message });
    }
};
