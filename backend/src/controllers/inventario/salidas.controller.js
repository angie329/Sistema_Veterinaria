import { query } from "../../config/database.js";

// obtiene todas las salidas con paginacion y busqueda
export const getSalidas = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const searchTerm = req.query.search || "";

        // calcula el offset para la paginacion
        const offset = (page - 1) * limit;
        const searchPattern = `%${searchTerm}%`;

        const countResult = await query(
            `SELECT COUNT(*) as total 
             FROM Inv_Movimiento m
             JOIN Inv_Articulo a ON m.id_Inv_ArticuloFk = a.id_Inv_Articulo
             WHERE m.Inv_TipoMovimiento = 'Salida' AND m.Inv_EsActivo = 1 AND a.Inv_Nombre LIKE ?`,
            [searchPattern]
        );
        const totalSalidas = countResult[0].total;
        const totalPages = Math.ceil(totalSalidas / limit);

        const salidas = await query(
            `SELECT
                m.id_Inv_Movimiento,
                DATE_FORMAT(m.Inv_Fecha, '%Y-%m-%d %H:%i:%s') as Fecha,
                a.Inv_Nombre AS ProductoNombre,
                m.Inv_Cantidad as Cantidad
             FROM Inv_Movimiento m
             JOIN Inv_Articulo a ON m.id_Inv_ArticuloFk = a.id_Inv_Articulo
             WHERE m.Inv_TipoMovimiento = 'Salida' AND m.Inv_EsActivo = 1 AND a.Inv_Nombre LIKE ?
             ORDER BY m.Inv_Fecha DESC            
              LIMIT ${limit} OFFSET ${offset}
            `, [searchPattern]);

        res.json({
            salidas,
            totalPages,
            currentPage: page,
        });
    } catch (error) {
        console.error("Error fetching salidas:", error);
        res.status(500).json({
            message: "Error al obtener las salidas",
            error: error.message,
        });
    }
};

// obtiene las opciones para los formularios de salidas (productos)
export const getSalidaOptions = async (req, res) => {
    try {
        const products = await query(
            "SELECT id_Inv_Articulo as id, Inv_Nombre as name FROM Inv_Articulo WHERE Inv_EsActivo = 1 ORDER BY Inv_Nombre"
        );

        res.json({ products });
    } catch (error) {
        console.error("Error fetching salida options:", error);
        res.status(500).json({
            message: "Error al obtener las opciones para salidas",
            error: error.message,
        });
    }
};

// obtiene una salida por su id y las opciones para el formulario
export const getSalidaById = async (req, res) => {
    try {
        const { id } = req.params;

        const sql = `
            SELECT 
                id_Inv_Movimiento as id,
                DATE_FORMAT(Inv_Fecha, '%Y-%m-%d') as fecha,
                id_Inv_ArticuloFk as producto,
                Inv_Cantidad as cantidad
            FROM Inv_Movimiento 
            WHERE id_Inv_Movimiento = ? AND Inv_TipoMovimiento = 'Salida'`;
        const [salida] = await query(sql, [id]);

        if (!salida) {
            return res.status(404).json({ message: "Salida no encontrada" });
        }

        const products = await query(
            `SELECT id_Inv_Articulo as id, Inv_Nombre as name 
             FROM Inv_Articulo 
             WHERE Inv_EsActivo = 1 
             ORDER BY Inv_Nombre`
        );

        res.json({
            salida,
            options: { products }
        });

    } catch (error) {
        console.error(`Error fetching salida with id ${req.params.id}:`, error);
        res.status(500).json({ message: "Error al obtener la salida", error: error.message });
    }
};

// crea una nueva salida
export const createSalida = async (req, res) => {
    try {
        const { producto, cantidad } = req.body;

        if (!producto || !cantidad) {
            return res.status(400).json({ message: "Faltan campos obligatorios." });
        }

        // verifica si hay stock suficiente
        const [product] = await query("SELECT Inv_StockActual FROM Inv_Articulo WHERE id_Inv_Articulo = ?", [producto]);

        if (!product) {
            return res.status(404).json({ message: "El producto especificado no existe." });
        }

        const requestedQuantity = parseInt(cantidad, 10);
        if (isNaN(requestedQuantity) || requestedQuantity <= 0) {
            return res.status(400).json({ message: "La cantidad debe ser un número positivo." });
        }

        if (product.Inv_StockActual < requestedQuantity) {
            return res.status(400).json({ message: `Stock insuficiente. Stock actual: ${product.Inv_StockActual}` });
        }

        const sql = `
            INSERT INTO Inv_Movimiento 
            (Inv_Fecha, id_Inv_ArticuloFk, Inv_TipoMovimiento, Inv_Cantidad, Gen_modulo_origenFk, Inv_EsActivo) 
            VALUES (NOW(), ?, 'Salida', ?, 7, 1)`;
        const result = await query(sql, [producto, cantidad]);

        // actualiza (resta) el stock del articulo
        const updateStockSql = `
            UPDATE Inv_Articulo 
            SET Inv_StockActual = Inv_StockActual - ? 
            WHERE id_Inv_Articulo = ?`;
        await query(updateStockSql, [cantidad, producto]);

        res.status(201).json({
            message: "Salida creada exitosamente",
            salidaId: result.insertId
        });

    } catch (error) {
        console.error("Error creating salida:", error);
        res.status(500).json({ message: "Error al crear la salida", error: error.message });
    }
};

// actualiza una salida existente
export const updateSalida = async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha, producto, cantidad } = req.body;

        if (!fecha || !producto || !cantidad) {
            return res.status(400).json({ message: "Faltan campos obligatorios." });
        }

        // aqui falta la logica para reajustar el stock

        const sql = `
            UPDATE Inv_Movimiento SET
                Inv_Fecha = ?, 
                id_Inv_ArticuloFk = ?, 
                Inv_Cantidad = ?
            WHERE id_Inv_Movimiento = ? AND Inv_TipoMovimiento = 'Salida'`;
        await query(sql, [fecha, producto, cantidad, id]);

        res.json({ message: "Salida actualizada exitosamente" });
    } catch (error) {
        console.error(`Error updating salida with id ${req.params.id}:`, error);
        res.status(500).json({ message: "Error al actualizar la salida", error: error.message });
    }
};

// cambia el estado de una salida (activa/inactiva)
export const toggleSalidaStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const [salida] = await query("SELECT Inv_EsActivo FROM Inv_Movimiento WHERE id_Inv_Movimiento = ?", [id]);

        if (!salida) {
            return res.status(404).json({ message: "Salida no encontrada." });
        }

        const newStatus = !salida.Inv_EsActivo;

        // aqui falta la logica para reajustar el stock si se desactiva/reactiva una salida

        const sql = "UPDATE Inv_Movimiento SET Inv_EsActivo = ? WHERE id_Inv_Movimiento = ?";
        await query(sql, [newStatus, id]);

        const action = newStatus ? "reactivada" : "desactivada";
        res.json({ message: `Salida ${action} exitosamente.` });

    } catch (error) {
        console.error(`Error toggling status for salida with id ${req.params.id}:`, error);
        res.status(500).json({ message: "Error al cambiar el estado de la salida", error: error.message });
    }
};