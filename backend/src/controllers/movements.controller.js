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
             WHERE a.Inv_Nombre LIKE ? AND m.Inv_EsActivo = 1`,
            [searchPattern]
        );
        const totalMovements = countResult[0].total;
        const totalPages = Math.ceil(totalMovements / limit);

        // Obtener los movimientos de la página actual
        const movements = await query(
            `SELECT 
                m.id_Inv_Movimiento,
                DATE_FORMAT(m.Inv_Fecha, '%Y-%m-%d %H:%i:%s') as Inv_Fecha,
                a.Inv_Nombre AS ProductoNombre,
                m.Inv_TipoMovimiento AS TipoMovimiento,
                m.Inv_Cantidad
             FROM Inv_Movimiento m
             JOIN Inv_Articulo a ON m.id_Inv_ArticuloFk = a.id_Inv_Articulo
             WHERE a.Inv_Nombre LIKE ? AND m.Inv_EsActivo = 1
             ORDER BY m.Inv_Fecha DESC
            LIMIT ${limit} OFFSET ${offset}`,
            [searchPattern]);

        res.json({
            movements,
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
                DATE_FORMAT(Inv_Fecha, '%Y-%m-%d %H:%i:%s') as fecha,
                id_Inv_ArticuloFk as producto,
                Inv_TipoMovimiento as tipo,
                Inv_Cantidad as cantidad,
                Inv_EsActivo as esActivo
            FROM Inv_Movimiento 
            WHERE id_Inv_Movimiento = ?`;
        const [movement] = await query(movementSql, [id]);

        if (!movement) {
            return res.status(404).json({ message: "Movimiento no encontrado" });
        }

        // Obtener lista de productos activos
        const products = await query(
            `SELECT id_Inv_Articulo as id, Inv_Nombre as name 
             FROM Inv_Articulo 
             WHERE Inv_EsActivo = 1 
             ORDER BY Inv_Nombre`
        );

        // Lista de tipos de movimiento según ENUM
        const movementTypes = [
            { id: 'Ingreso', name: 'Ingreso' },
            { id: 'Salida', name: 'Salida' }
        ];

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

// Obtiene las opciones para los formularios de movimientos
export const getMovementOptions = async (req, res) => {
    try {
        const products = await query(
            "SELECT id_Inv_Articulo as id, Inv_Nombre as name FROM Inv_Articulo WHERE Inv_EsActivo = 1 ORDER BY Inv_Nombre"
        );

        const movementTypes = [
            { id: 'Ingreso', name: 'Ingreso' },
            { id: 'Salida', name: 'Salida' }
        ];

        res.json({
            products,
            movementTypes
        });
    } catch (error) {
        console.error("Error fetching movement options:", error);
        res.status(500).json({
            message: "Error al obtener las opciones para movimientos",
            error: error.message,
        });
    }
};

// Crea un nuevo movimiento
export const createMovement = async (req, res) => {
    try {
        const { fecha, producto, tipo, cantidad } = req.body;

        if (!fecha || !producto || !tipo || !cantidad) {
            return res.status(400).json({ message: "Faltan campos obligatorios." });
        }

        const sql = `
            INSERT INTO Inv_Movimiento 
            (Inv_Fecha, id_Inv_ArticuloFk, Inv_TipoMovimiento, Inv_Cantidad, Gen_modulo_origenFk, Inv_EsActivo) 
            VALUES (?, ?, ?, ?, 7, 1)`;
        const result = await query(sql, [fecha, producto, tipo, cantidad]);

        res.status(201).json({
            message: "Movimiento creado exitosamente",
            movementId: result.insertId
        });

    } catch (error) {
        console.error("Error creating movement:", error);
        res.status(500).json({ message: "Error al crear el movimiento", error: error.message });
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
                            Inv_Fecha = '${fecha}', 
                            id_Inv_ArticuloFk = ${producto}, 
                            Inv_TipoMovimiento = '${tipo}', 
                            Inv_Cantidad = ${cantidad}
                        WHERE id_Inv_Movimiento = ${id};
                    `;
        await query(sql);


        res.json({ message: "Movimiento actualizado exitosamente" });
    } catch (error) {
        console.error(`Error updating movement with id ${req.params.id}:`, error);
        res.status(500).json({ message: "Error al actualizar el movimiento", error: error.message });
    }
};

// Cambia el estado de un movimiento (activo/inactivo)
export const toggleMovementStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const [movement] = await query("SELECT Inv_EsActivo FROM Inv_Movimiento WHERE id_Inv_Movimiento = ?", [id]);

        if (!movement) {
            return res.status(404).json({ message: "Movimiento no encontrado." });
        }

        const newStatus = !movement.Inv_EsActivo;

        const sql = "UPDATE Inv_Movimiento SET Inv_EsActivo = ? WHERE id_Inv_Movimiento = ?";
        await query(sql, [newStatus, id]);

        const action = newStatus ? "reactivado" : "desactivado";
        res.json({ message: `Movimiento ${action} exitosamente.` });

    } catch (error) {
        console.error(`Error toggling status for movement with id ${req.params.id}:`, error);
        res.status(500).json({ message: "Error al cambiar el estado del movimiento", error: error.message });
    }
};
