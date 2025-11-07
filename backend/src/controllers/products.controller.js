import { query } from "../config/database.js";

export const getProducts = async (req, res) => {
    // 1. Leer los parámetros de la URL
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const searchTerm = req.query.search || "";

        // 2. Lógica para obtener los datos de la base de datos
        const offset = (page - 1) * limit;
        const searchPattern = `%${searchTerm}%`;

        // Query para contar el total de productos que coinciden con la búsqueda
        const countResult = await query(
            "SELECT COUNT(*) as total FROM Inv_Articulo WHERE Inv_Nombre LIKE ?",
            [searchPattern]
        );
        const totalProducts = countResult[0].total;
        const totalPages = Math.ceil(totalProducts / limit);

        // Query para obtener los productos de la página actual
        // Nota: LIMIT y OFFSET se insertan directamente en el string.
        // Esto es seguro porque 'limit' y 'offset' son números enteros controlados por nosotros.
        const products = await query(
            `SELECT 
        a.id_Inv_Articulo,
        a.Inv_Nombre,
        t.Inv_Descripcion AS TipoArticulo,
        a.Inv_CantUnidadMedida,
        iva.Gen_porcentaje AS IVA, 
        a.Inv_PrecioUnitario,
        a.Inv_StockActual,
        a.Inv_Categoria,
        a.Inv_EsActivo
        FROM Inv_Articulo a
        LEFT JOIN Inv_TipoArticulo t 
        ON a.id_Inv_TipoArticuloFk = t.id_Inv_TipoArticulo
        LEFT JOIN Gen_Iva iva
        ON a.id_Gen_IVAFk = iva.Gen_id_iva
        LEFT JOIN Gen_UnidadMedida u
        ON a.id_Gen_UnidadMedidaFk = u.Gen_id_unidad_medida
        ORDER BY a.id_Inv_Articulo ASC
        LIMIT ${limit} OFFSET ${offset};`,
            [searchPattern]
        );

        // 3. Enviar la respuesta en el formato que el frontend espera
        res.json({
            products: products,
            totalPages: totalPages,
            currentPage: page,
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({
            message: "Error al obtener los productos",
            error: error.message,
        });
    }
};

export const createProduct = async (req, res) => {
    try {
        const {
            name,
            tipoArticulo,
            unidadMedida,
            cantidad,
            iva,
            precio,
            stock,
            categoria
        } = req.body;

        // Validación simple
        if (!name || !tipoArticulo || !unidadMedida || !iva || !precio) {
            return res.status(400).json({ message: "Faltan campos obligatorios." });
        }

        const sql = `
            INSERT INTO Inv_Articulo 
            (Inv_Nombre, id_Inv_TipoArticuloFk, id_Gen_UnidadMedidaFk, Inv_CantUnidadMedida, id_Gen_IVAFk, Inv_PrecioUnitario, Inv_StockActual, Inv_Categoria, Gen_modulo_origenFK) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await query(sql, [name, tipoArticulo, unidadMedida, cantidad, iva, precio, stock, categoria]);

        res.status(201).json({
            message: "Producto creado exitosamente",
            productId: result.insertId
        });

    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ message: "Error al crear el producto", error: error.message });
    }
};
