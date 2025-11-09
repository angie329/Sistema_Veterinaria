import { query } from "../../config/database.js";

export const getProducts = async (req, res) => {
    // 1. Leer los parámetros de la URL
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) - 1 || 10;
        const searchTerm = req.query.search || "";

        // 2. Lógica para obtener los datos de la base de datos
        const offset = (page - 1) * limit;
        const searchPattern = `%${searchTerm}%`;

        // Query para contar el total de productos que coinciden con la búsqueda
        const countResult = await query(
            "SELECT COUNT(*) as total FROM Inv_Articulo WHERE Inv_Nombre LIKE ? AND Inv_EsActivo = 1",
            [searchPattern,]
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
        u.Gen_nombre AS UnidadMedida, 
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
        WHERE a.Inv_Nombre LIKE ? AND a.Inv_EsActivo = 1
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

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `
            SELECT 
                id_Inv_Articulo as id,
                Inv_Nombre as name,
                id_Inv_TipoArticuloFk as tipoArticulo,
                id_Gen_UnidadMedidaFk as unidadMedida,
                Inv_CantUnidadMedida as cantidad,
                id_Gen_IVAFk as iva,
                Inv_PrecioUnitario as precio,
                Inv_StockActual as stock,
                Inv_Categoria as categoria
            FROM Inv_Articulo 
            WHERE id_Inv_Articulo = ?`;

        const products = await query(sql, [id]);

        if (products.length === 0) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.json(products[0]);

    } catch (error) {
        console.error(`Error fetching product with id ${req.params.id}:`, error);
        res.status(500).json({ message: "Error al obtener el producto", error: error.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, tipoArticulo, unidadMedida, cantidad, iva, precio, stock, categoria } = req.body;

        if (!name || !tipoArticulo || !unidadMedida || !iva || !precio) {
            return res.status(400).json({ message: "Faltan campos obligatorios." });
        }

        const sql = `
            UPDATE Inv_Articulo SET
                Inv_Nombre = ?, id_Inv_TipoArticuloFk = ?, id_Gen_UnidadMedidaFk = ?, 
                Inv_CantUnidadMedida = ?, id_Gen_IVAFk = ?, Inv_PrecioUnitario = ?, 
                Inv_StockActual = ?, Inv_Categoria = ?
            WHERE id_Inv_Articulo = ?
        `;

        await query(sql, [name, tipoArticulo, unidadMedida, cantidad, iva, precio, stock, categoria, id]);

        res.json({ message: "Producto actualizado exitosamente" });
    } catch (error) {
        console.error(`Error updating product with id ${req.params.id}:`, error);
        res.status(500).json({ message: "Error al actualizar el producto", error: error.message });
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
            categoria,
        } = req.body;

        // Validación simple
        if (!name || !tipoArticulo || !unidadMedida || !iva || !precio) {
            return res.status(400).json({ message: "Faltan campos obligatorios." });
        }

        const sql = `
            INSERT INTO Inv_Articulo 
            (Inv_Nombre, id_Inv_TipoArticuloFk, id_Gen_UnidadMedidaFk, Inv_CantUnidadMedida, id_Gen_IVAFk, Inv_PrecioUnitario, Inv_StockActual, Inv_Categoria, Gen_modulo_origenFk) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await query(sql, [name, tipoArticulo, unidadMedida, cantidad, iva, precio, stock, categoria, 7]);

        res.status(201).json({
            message: "Producto creado exitosamente",
            productId: result.insertId
        });

    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ message: "Error al crear el producto", error: error.message });
    }
};

export const toggleProductStatus = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Obtener el estado actual del producto
        const [product] = await query("SELECT Inv_EsActivo FROM Inv_Articulo WHERE id_Inv_Articulo = ?", [id]);

        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado." });
        }

        // 2. Calcular el nuevo estado (invertir el actual)
        const newStatus = !product.Inv_EsActivo;

        // 3. Actualizar la base de datos
        const sql = "UPDATE Inv_Articulo SET Inv_EsActivo = ? WHERE id_Inv_Articulo = ?";
        await query(sql, [newStatus, id]);

        const action = newStatus ? "reactivado" : "desactivado";
        res.json({ message: `Producto ${action} exitosamente.` });

    } catch (error) {
        console.error(`Error toggling status for product with id ${req.params.id}:`, error);
        res.status(500).json({ message: "Error al cambiar el estado del producto", error: error.message });
    }
};
