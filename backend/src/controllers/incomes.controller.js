import { query } from "../config/database.js";

export const getIncomes = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) - 1 || 10;
        const searchTerm = req.query.search || "";

        const offset = (page - 1) * limit;
        const searchPattern = `%${searchTerm}%`;

        const countResult = await query(
            `SELECT COUNT(*) as total 
             FROM Inv_Movimiento m
             JOIN Inv_Articulo a ON m.id_Inv_ArticuloFk = a.id_Inv_Articulo
             WHERE m.Inv_TipoMovimiento = 'Ingreso' AND m.Inv_EsActivo = 1 AND a.Inv_Nombre LIKE ?
            `,
            [searchPattern]
        );
        const totalIncomes = countResult[0].total;
        const totalPages = Math.ceil(totalIncomes / limit);

        const incomes = await query(
            `SELECT
                m.id_Inv_Movimiento,
                DATE_FORMAT(m.Inv_Fecha, '%Y-%m-%d %H:%i:%s') as Fecha,
                a.Inv_Nombre AS ProductoNombre,
                m.Inv_Cantidad as Cantidad
             FROM Inv_Movimiento m
             JOIN Inv_Articulo a ON m.id_Inv_ArticuloFk = a.id_Inv_Articulo
             WHERE m.Inv_TipoMovimiento = 'Ingreso' AND m.Inv_EsActivo = 1 AND a.Inv_Nombre LIKE ?
             ORDER BY m.Inv_Fecha DESC            
             LIMIT ${limit} OFFSET ${offset}
            `,
            [searchPattern]
        );

        res.json({
            incomes,
            totalPages,
            currentPage: page,
        });
    } catch (error) {
        console.error("Error fetching incomes:", error);
        res.status(500).json({
            message: "Error al obtener los ingresos",
            error: error.message,
        });
    }
};

export const getIncomeOptions = async (req, res) => {
    try {
        const products = await query(
            "SELECT id_Inv_Articulo as id, Inv_Nombre as name FROM Inv_Articulo WHERE Inv_EsActivo = 1 ORDER BY Inv_Nombre"
        );

        res.json({
            products,
        });
    } catch (error) {
        console.error("Error fetching income options:", error);
        res.status(500).json({
            message: "Error al obtener las opciones para ingresos",
            error: error.message,
        });
    }
};

export const getIncomeById = async (req, res) => {
    try {
        const { id } = req.params;

        const incomeSql = `
            SELECT 
                id_Inv_Movimiento as id,
                DATE_FORMAT(Inv_Fecha, '%Y-%m-%d %H:%i:%s') as fecha,
                id_Inv_ArticuloFk as producto,
                Inv_Cantidad as cantidad
            FROM Inv_Movimiento 
            WHERE id_Inv_Movimiento = ? AND Inv_TipoMovimiento = 'Ingreso'`;
        const [income] = await query(incomeSql, [id]);

        if (!income) {
            return res.status(404).json({ message: "Ingreso no encontrado" });
        }

        const products = await query(
            `SELECT id_Inv_Articulo as id, Inv_Nombre as name 
             FROM Inv_Articulo 
             WHERE Inv_EsActivo = 1 
             ORDER BY Inv_Nombre`
        );

        res.json({
            income,
            options: {
                products,
            }
        });

    } catch (error) {
        console.error(`Error fetching income with id ${req.params.id}:`, error);
        res.status(500).json({ message: "Error al obtener el ingreso", error: error.message });
    }
};

export const createIncome = async (req, res) => {
    try {
        const { fecha, producto, cantidad } = req.body;

        if (!fecha || !producto || !cantidad) {
            return res.status(400).json({ message: "Faltan campos obligatorios." });
        }

        const sql = `
            INSERT INTO Inv_Movimiento 
            (Inv_Fecha, id_Inv_ArticuloFk, Inv_TipoMovimiento, Inv_Cantidad, Gen_modulo_origenFk, Inv_EsActivo) 
            VALUES (?, ?, 'Ingreso', ?, 7, 1)`;
        const result = await query(sql, [fecha, producto, cantidad]);

        res.status(201).json({
            message: "Ingreso creado exitosamente",
            incomeId: result.insertId
        });

    } catch (error) {
        console.error("Error creating income:", error);
        res.status(500).json({ message: "Error al crear el ingreso", error: error.message });
    }
};

export const updateIncome = async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha, producto, cantidad } = req.body;

        if (!fecha || !producto || !cantidad) {
            return res.status(400).json({ message: "Faltan campos obligatorios." });
        }

        const sql = `
            UPDATE Inv_Movimiento SET
                Inv_Fecha = ?, 
                id_Inv_ArticuloFk = ?, 
                Inv_Cantidad = ?
            WHERE id_Inv_Movimiento = ? AND Inv_TipoMovimiento = 'Ingreso'`;
        await query(sql, [fecha, producto, cantidad, id]);

        res.json({ message: "Ingreso actualizado exitosamente" });
    } catch (error) {
        console.error(`Error updating income with id ${req.params.id}:`, error);
        res.status(500).json({ message: "Error al actualizar el ingreso", error: error.message });
    }
};

export const toggleIncomeStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const [income] = await query("SELECT Inv_EsActivo FROM Inv_Movimiento WHERE id_Inv_Movimiento = ?", [id]);

        if (!income) {
            return res.status(404).json({ message: "Ingreso no encontrado." });
        }

        const newStatus = !income.Inv_EsActivo;

        const sql = "UPDATE Inv_Movimiento SET Inv_EsActivo = ? WHERE id_Inv_Movimiento = ?";
        await query(sql, [newStatus, id]);

        const action = newStatus ? "reactivado" : "desactivado";
        res.json({ message: `Ingreso ${action} exitosamente.` });

    } catch (error) {
        console.error(`Error toggling status for income with id ${req.params.id}:`, error);
        res.status(500).json({ message: "Error al cambiar el estado del ingreso", error: error.message });
    }
};
