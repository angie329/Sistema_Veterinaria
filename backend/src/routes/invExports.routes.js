import { Router } from "express";
import PDFDocument from "pdfkit-table";
import ExcelJS from "exceljs";
import { query } from "../config/database.js";

export const invExportsRouter = Router();

invExportsRouter.get("/productspdf", async (req, res) => {
    try {
        const data = await query(`
      SELECT 
          a.id_Inv_Articulo AS id,
          a.Inv_Nombre AS nombre,
          t.Inv_Descripcion AS tipoArticulo,
          u.Gen_nombre AS unidadMedida,
          a.Inv_CantUnidadMedida AS cantidadPorUnidad,
          iva.Gen_porcentaje AS iva, 
          a.Inv_PrecioUnitario AS precioUnitario,
          a.Inv_StockActual AS stockActual,
          a.Inv_Categoria AS categoria
      FROM Inv_Articulo a
      LEFT JOIN Inv_TipoArticulo t ON a.id_Inv_TipoArticuloFk = t.id_Inv_TipoArticulo
      LEFT JOIN Gen_Iva iva ON a.id_Gen_IVAFk = iva.Gen_id_iva
      LEFT JOIN Gen_UnidadMedida u ON a.id_Gen_UnidadMedidaFk = u.Gen_id_unidad_medida
      WHERE a.Inv_EsActivo = 1
      ORDER BY a.id_Inv_Articulo ASC
    `);

        // Crear documento
        const doc = new PDFDocument({ margin: 30, size: "A4" });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=reporte_productos.pdf");

        doc.pipe(res);

        // Título
        doc.fontSize(18).text("Reporte de Productos", { align: "center" });
        doc.moveDown(1.5);

        // Crear tabla
        const table = {
            headers: [
                "ID Artículo",
                "Nombre",
                "Tipo de Artículo",
                "Unidad de Medida",
                "Cantidad por Unidad",
                "IVA",
                "Precio Unitario",
                "Stock Actual",
                "Categoría",
            ],
            rows: data.map((item) => [
                item.id,
                item.nombre,
                item.tipoArticulo || "",
                item.unidadMedida || "",
                item.cantidadPorUnidad || "",
                `${item.iva ?? 0}%`,
                `${item.precioUnitario}`,
                item.stockActual ?? 0,
                item.categoria || "",
            ]),
        };

        // Dibujar tabla
        await doc.table(table, {
            prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
            prepareRow: (row, i) => doc.font("Helvetica").fontSize(9),
            columnSpacing: 5,
            padding: 3,
        });

        doc.end();
    } catch (error) {
        console.error("Error generando reporte PDF:", error);
        res.status(500).json({
            message: "Error al generar el PDF de productos",
            error: error.message,
        });
    }
});

invExportsRouter.get("/productsexcel", async (req, res) => {
    try {
        const data = await query(`
      SELECT 
          a.id_Inv_Articulo AS id,
          a.Inv_Nombre AS nombre,
          t.Inv_Descripcion AS tipoArticulo,
          u.Gen_nombre AS unidadMedida,
          a.Inv_CantUnidadMedida AS cantidadPorUnidad,
          iva.Gen_porcentaje AS iva, 
          a.Inv_PrecioUnitario AS precioUnitario,
          a.Inv_StockActual AS stockActual,
          a.Inv_Categoria AS categoria
      FROM Inv_Articulo a
      LEFT JOIN Inv_TipoArticulo t ON a.id_Inv_TipoArticuloFk = t.id_Inv_TipoArticulo
      LEFT JOIN Gen_Iva iva ON a.id_Gen_IVAFk = iva.Gen_id_iva
      LEFT JOIN Gen_UnidadMedida u ON a.id_Gen_UnidadMedidaFk = u.Gen_id_unidad_medida
      WHERE a.Inv_EsActivo = 1
      ORDER BY a.id_Inv_Articulo ASC
    `);

        // Crear nuevo libro y hoja
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Productos");

        // Definir encabezados de columna
        worksheet.columns = [
            { header: "ID Artículo", key: "id", width: 12 },
            { header: "Nombre", key: "nombre", width: 25 },
            { header: "Tipo de Artículo", key: "tipoArticulo", width: 20 },
            { header: "Unidad de Medida", key: "unidadMedida", width: 20 },
            { header: "Cantidad por Unidad", key: "cantidadPorUnidad", width: 18 },
            { header: "IVA", key: "iva", width: 10 },
            { header: "Precio Unitario", key: "precioUnitario", width: 15 },
            { header: "Stock Actual", key: "stockActual", width: 15 },
            { header: "Categoría", key: "categoria", width: 20 },
        ];

        // Agregar filas
        data.forEach((item) => {
            worksheet.addRow({
                id: item.id,
                nombre: item.nombre,
                tipoArticulo: item.tipoArticulo || "",
                unidadMedida: item.unidadMedida || "",
                cantidadPorUnidad: item.cantidadPorUnidad || "",
                iva: `${item.iva ?? 0}%`,
                precioUnitario: item.precioUnitario,
                stockActual: item.stockActual ?? 0,
                categoria: item.categoria || "",
            });
        });

        // Aplicar estilos a encabezados
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF0070C0" }, // azul
            };
            cell.alignment = { vertical: "middle", horizontal: "center" };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });

        // Bordes y alineación general
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                };
                cell.alignment = { vertical: "middle", horizontal: "left" };
            });
            if (rowNumber !== 1) row.height = 20;
        });

        // Configurar headers HTTP
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=reporte_productos.xlsx"
        );

        // Escribir archivo al response
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error("Error generando Excel:", error);
        res.status(500).json({
            message: "Error al generar el Excel de productos",
            error: error.message,
        });
    }
});

invExportsRouter.get("/productsjson", async (req, res) => {
    try {
        const data = await query(`
      SELECT 
          a.id_Inv_Articulo AS id,
          a.Inv_Nombre AS nombre,
          t.Inv_Descripcion AS tipoArticulo,
          u.Gen_nombre AS unidadMedida,
          a.Inv_CantUnidadMedida AS cantidadPorUnidad,
          iva.Gen_porcentaje AS iva, 
          a.Inv_PrecioUnitario AS precioUnitario,
          a.Inv_StockActual AS stockActual,
          a.Inv_Categoria AS categoria
      FROM Inv_Articulo a
      LEFT JOIN Inv_TipoArticulo t ON a.id_Inv_TipoArticuloFk = t.id_Inv_TipoArticulo
      LEFT JOIN Gen_Iva iva ON a.id_Gen_IVAFk = iva.Gen_id_iva
      LEFT JOIN Gen_UnidadMedida u ON a.id_Gen_UnidadMedidaFk = u.Gen_id_unidad_medida
      WHERE a.Inv_EsActivo = 1
      ORDER BY a.id_Inv_Articulo ASC
    `);

        // 1. Configurar encabezados
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", "attachment; filename=reporte_productos.json");

        // 2. Enviar el JSON formateado (bonito)
        res.send(JSON.stringify(data, null, 2));

    } catch (error) {
        console.error("Error generando JSON:", error);
        res.status(500).json({
            message: "Error al generar el JSON de productos",
            error: error.message,
        });
    }
});

invExportsRouter.get("/productstxt", async (req, res) => {
    try {
        const data = await query(`
      SELECT 
          a.id_Inv_Articulo AS id,
          a.Inv_Nombre AS nombre,
          t.Inv_Descripcion AS tipoArticulo,
          u.Gen_nombre AS unidadMedida,
          a.Inv_CantUnidadMedida AS cantidadPorUnidad,
          iva.Gen_porcentaje AS iva, 
          a.Inv_PrecioUnitario AS precioUnitario,
          a.Inv_StockActual AS stockActual,
          a.Inv_Categoria AS categoria
      FROM Inv_Articulo a
      LEFT JOIN Inv_TipoArticulo t ON a.id_Inv_TipoArticuloFk = t.id_Inv_TipoArticulo
      LEFT JOIN Gen_Iva iva ON a.id_Gen_IVAFk = iva.Gen_id_iva
      LEFT JOIN Gen_UnidadMedida u ON a.id_Gen_UnidadMedidaFk = u.Gen_id_unidad_medida
      WHERE a.Inv_EsActivo = 1
      ORDER BY a.id_Inv_Articulo ASC
    `);

        // Encabezados de columnas
        const headers = [
            "ID",
            "Nombre",
            "Tipo de Artículo",
            "Unidad Medida",
            "Cantidad/Unidad",
            "IVA",
            "Precio Unitario",
            "Stock",
            "Categoría",
        ];

        // Crea las filas como texto tabulado
        const lines = data.map(item =>
            [
                item.id,
                item.nombre,
                item.tipoArticulo || "",
                item.unidadMedida || "",
                item.cantidadPorUnidad || "",
                `${item.iva ?? 0}%`,
                `$${item.precioUnitario}`,
                item.stockActual ?? 0,
                item.categoria || "",
            ].join("\t")
        );

        // Unimos encabezado + líneas
        const textContent = [headers.join("\t"), ...lines].join("\n");

        // Configurar respuesta
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Content-Disposition", "attachment; filename=reporte_productos.txt");
        res.send(textContent);

    } catch (error) {
        console.error("Error generando TXT:", error);
        res.status(500).json({
            message: "Error al generar el TXT de productos",
            error: error.message,
        });
    }
});

invExportsRouter.get("/productscsv", async (req, res) => {
    try {
        const data = await query(`
      SELECT 
          a.id_Inv_Articulo AS id,
          a.Inv_Nombre AS nombre,
          t.Inv_Descripcion AS tipoArticulo,
          u.Gen_nombre AS unidadMedida,
          a.Inv_CantUnidadMedida AS cantidadPorUnidad,
          iva.Gen_porcentaje AS iva, 
          a.Inv_PrecioUnitario AS precioUnitario,
          a.Inv_StockActual AS stockActual,
          a.Inv_Categoria AS categoria
      FROM Inv_Articulo a
      LEFT JOIN Inv_TipoArticulo t ON a.id_Inv_TipoArticuloFk = t.id_Inv_TipoArticulo
      LEFT JOIN Gen_Iva iva ON a.id_Gen_IVAFk = iva.Gen_id_iva
      LEFT JOIN Gen_UnidadMedida u ON a.id_Gen_UnidadMedidaFk = u.Gen_id_unidad_medida
      WHERE a.Inv_EsActivo = 1
      ORDER BY a.id_Inv_Articulo ASC
    `);

        // Encabezados
        const headers = [
            "ID Artículo",
            "Nombre",
            "Tipo de Artículo",
            "Unidad de Medida",
            "Cantidad por Unidad",
            "IVA",
            "Precio Unitario",
            "Stock Actual",
            "Categoría",
        ];

        // Convertir filas a formato CSV
        const lines = data.map(item =>
            [
                item.id,
                `"${item.nombre}"`, // comillas para evitar conflicto con comas dentro del texto
                `"${item.tipoArticulo || ""}"`,
                `"${item.unidadMedida || ""}"`,
                item.cantidadPorUnidad ?? "",
                item.iva ?? 0,
                item.precioUnitario,
                item.stockActual ?? 0,
                `"${item.categoria || ""}"`,
            ].join(",")
        );

        // Unir encabezado y filas
        const csvContent = [headers.join(","), ...lines].join("\n");

        // Configurar respuesta
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", "attachment; filename=reporte_productos.csv");
        res.send(csvContent);

    } catch (error) {
        console.error("Error generando CSV:", error);
        res.status(500).json({
            message: "Error al generar el CSV de productos",
            error: error.message,
        });
    }
});

invExportsRouter.get("/movementspdf", async (req, res) => {
    try {
        const data = await query(`
      SELECT 
          m.id_Inv_Movimiento AS id,
          DATE_FORMAT(m.Inv_Fecha, '%Y-%m-%d %H:%i:%s') AS fecha,
          a.Inv_Nombre AS producto,
          m.Inv_TipoMovimiento AS tipo,
          m.Inv_Cantidad AS cantidad
      FROM Inv_Movimiento m
      JOIN Inv_Articulo a ON m.id_Inv_ArticuloFk = a.id_Inv_Articulo
      WHERE m.Inv_EsActivo = 1
      ORDER BY m.Inv_Fecha DESC
    `);

        // Crear documento PDF
        const doc = new PDFDocument({ margin: 30, size: "A4" });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=reporte_movimientos.pdf");

        doc.pipe(res);

        // Título
        doc.fontSize(18).text("Reporte de Movimientos de Inventario", { align: "center" });
        doc.moveDown(1.5);

        // Crear tabla
        const table = {
            headers: ["Fecha", "Producto", "Tipo", "Cantidad"],
            rows: data.map((item) => [
                item.fecha,
                item.producto,
                item.tipo,
                item.cantidad,
            ]),
        };

        // Dibujar tabla en el PDF
        await doc.table(table, {
            prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
            prepareRow: (row, i) => doc.font("Helvetica").fontSize(9),
            columnSpacing: 5,
            padding: 3,
            width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
        });

        doc.end();

    } catch (error) {
        console.error("Error generando reporte PDF:", error);
        res.status(500).json({
            message: "Error al generar el PDF de movimientos",
            error: error.message,
        });
    }
});

invExportsRouter.get("/movementsexcel", async (req, res) => {
    try {
        // Obtener datos desde la BD
        const data = await query(`
      SELECT 
          m.id_Inv_Movimiento AS id,
          DATE_FORMAT(m.Inv_Fecha, '%Y-%m-%d %H:%i:%s') AS fecha,
          a.Inv_Nombre AS producto,
          m.Inv_TipoMovimiento AS tipo,
          m.Inv_Cantidad AS cantidad
      FROM Inv_Movimiento m
      JOIN Inv_Articulo a ON m.id_Inv_ArticuloFk = a.id_Inv_Articulo
      WHERE m.Inv_EsActivo = 1
      ORDER BY m.Inv_Fecha DESC
    `);

        // Crear libro y hoja
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Movimientos");

        // Encabezados
        sheet.columns = [
            { header: "Fecha", key: "fecha", width: 20 },
            { header: "Producto", key: "producto", width: 25 },
            { header: "Tipo", key: "tipo", width: 15 },
            { header: "Cantidad", key: "cantidad", width: 12 },
        ];

        // Agregar filas
        data.forEach((item) => {
            sheet.addRow({
                fecha: item.fecha,
                producto: item.producto,
                tipo: item.tipo,
                cantidad: item.cantidad,
            });
        });

        // Estilo del encabezado
        sheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
            cell.alignment = { horizontal: "center" };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFD9E1F2" }, // azul claro
            };
            cell.border = {
                top: { style: "thin" },
                bottom: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" },
            };
        });

        // Configurar headers HTTP
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=reporte_movimientos.xlsx"
        );

        // Enviar archivo Excel al cliente
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error("Error generando reporte Excel:", error);
        res.status(500).json({
            message: "Error al generar el Excel de movimientos",
            error: error.message,
        });
    }
});


invExportsRouter.get("/movementsjson", async (req, res) => {
    try {
        // Obtener los movimientos desde la base de datos
        const data = await query(`
      SELECT 
          m.id_Inv_Movimiento AS id,
          DATE_FORMAT(m.Inv_Fecha, '%Y-%m-%d %H:%i:%s') AS fecha,
          a.Inv_Nombre AS producto,
          m.Inv_TipoMovimiento AS tipo,
          m.Inv_Cantidad AS cantidad
      FROM Inv_Movimiento m
      JOIN Inv_Articulo a ON m.id_Inv_ArticuloFk = a.id_Inv_Articulo
      WHERE m.Inv_EsActivo = 1
      ORDER BY m.Inv_Fecha DESC
    `);

        // Configurar los encabezados HTTP para descarga
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", "attachment; filename=reporte_movimientos.json");

        // Enviar el JSON directamente al cliente
        res.end(JSON.stringify(data, null, 2)); // “pretty print” con 2 espacios
    } catch (error) {
        console.error("Error generando reporte JSON:", error);
        res.status(500).json({
            message: "Error al generar el JSON de movimientos",
            error: error.message,
        });
    }
});

invExportsRouter.get("/movementscsv", async (req, res) => {
    try {
        const data = await query(`
            SELECT 
                m.id_Inv_Movimiento AS id,
                DATE_FORMAT(m.Inv_Fecha, '%Y-%m-%d %H:%i:%s') AS fecha,
                a.Inv_Nombre AS producto,
                m.Inv_TipoMovimiento AS tipo,
                m.Inv_Cantidad AS cantidad,
                m.Inv_EsActivo AS activo
            FROM Inv_Movimiento m
            JOIN Inv_Articulo a ON m.id_Inv_ArticuloFk = a.id_Inv_Articulo
            WHERE m.Inv_EsActivo = 1
            ORDER BY m.Inv_Fecha DESC
        `);

        // Encabezados CSV
        const headers = [
            "ID Movimiento",
            "Fecha",
            "Producto",
            "Tipo de Movimiento",
            "Cantidad",
        ];

        // Convertir los registros a líneas CSV
        const lines = data.map(item =>
            [
                item.id,
                `"${item.fecha}"`,
                `"${item.producto}"`,
                `"${item.tipo}"`,
                item.cantidad ?? 0,
            ].join(",")
        );

        // Unir encabezado + filas
        const csvContent = [headers.join(","), ...lines].join("\n");

        // Configurar respuesta HTTP
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", "attachment; filename=reporte_movimientos.csv");
        res.send(csvContent);

    } catch (error) {
        console.error("Error generando CSV de movimientos:", error);
        res.status(500).json({
            message: "Error al generar el CSV de movimientos",
            error: error.message,
        });
    }
});

invExportsRouter.get("/movementstxt", async (req, res) => {
    try {
        const data = await query(`
            SELECT 
                m.id_Inv_Movimiento AS id,
                DATE_FORMAT(m.Inv_Fecha, '%Y-%m-%d %H:%i:%s') AS fecha,
                a.Inv_Nombre AS producto,
                m.Inv_TipoMovimiento AS tipo,
                m.Inv_Cantidad AS cantidad
            FROM Inv_Movimiento m
            JOIN Inv_Articulo a ON m.id_Inv_ArticuloFk = a.id_Inv_Articulo
            WHERE m.Inv_EsActivo = 1
            ORDER BY m.Inv_Fecha DESC
        `);

        // Encabezados de columnas
        const headers = [
            "ID Movimiento",
            "Fecha",
            "Producto",
            "Tipo de Movimiento",
            "Cantidad",
        ];

        // Convertir las filas a texto tabulado
        const lines = data.map(item =>
            [
                item.id,
                item.fecha,
                item.producto,
                item.tipo,
                item.cantidad ?? 0,
            ].join("\t")
        );

        // Combinar encabezado + filas
        const textContent = [headers.join("\t"), ...lines].join("\n");

        // Configurar respuesta HTTP
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Content-Disposition", "attachment; filename=reporte_movimientos.txt");
        res.send(textContent);

    } catch (error) {
        console.error("Error generando TXT de movimientos:", error);
        res.status(500).json({
            message: "Error al generar el TXT de movimientos",
            error: error.message,
        });
    }
});

invExportsRouter.get("/incomepdf", async (req, res) => {
    try {
        const data = await query(`
            SELECT 
                m.id_Inv_Movimiento AS id,
                DATE_FORMAT(m.Inv_Fecha, '%Y-%m-%d %H:%i:%s') AS fecha,
                a.Inv_Nombre AS producto,
                m.Inv_TipoMovimiento AS tipo,
                m.Inv_Cantidad AS cantidad
            FROM Inv_Movimiento m
            JOIN Inv_Articulo a ON m.id_Inv_ArticuloFk = a.id_Inv_Articulo
            WHERE m.Inv_EsActivo = 1
              AND m.Inv_TipoMovimiento = 'Ingreso'
            ORDER BY m.Inv_Fecha DESC
        `);

        // Crear documento PDF
        const doc = new PDFDocument({ margin: 30, size: "A4" });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=reporte_ingresos.pdf");

        doc.pipe(res);

        // Encabezado principal
        doc.fontSize(18).text("Reporte de Movimientos - Ingresos", { align: "center" });
        doc.moveDown(1.5);

        // Tabla de ingresos
        const table = {
            headers: [
                "ID Movimiento",
                "Fecha",
                "Producto",
                "Tipo de Movimiento",
                "Cantidad",
            ],
            rows: data.map((item) => [
                item.id,
                item.fecha,
                item.producto,
                item.tipo,
                item.cantidad ?? 0,
            ]),
        };

        await doc.table(table, {
            prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
            prepareRow: (row, i) => doc.font("Helvetica").fontSize(9),
            columnSpacing: 5,
            padding: 3,
        });

        doc.end();

    } catch (error) {
        console.error("Error generando PDF de movimientos de ingresos:", error);
        res.status(500).json({
            message: "Error al generar el PDF de movimientos de ingresos",
            error: error.message,
        });
    }
});

invExportsRouter.get("/incomeexcel", async (req, res) => {
    try {
        const data = await query(`
            SELECT 
                m.id_Inv_Movimiento AS id,
                DATE_FORMAT(m.Inv_Fecha, '%Y-%m-%d %H:%i:%s') AS fecha,
                a.Inv_Nombre AS producto,
                m.Inv_TipoMovimiento AS tipo,
                m.Inv_Cantidad AS cantidad
            FROM Inv_Movimiento m
            JOIN Inv_Articulo a ON m.id_Inv_ArticuloFk = a.id_Inv_Articulo
            WHERE m.Inv_EsActivo = 1
              AND m.Inv_TipoMovimiento = 'Ingreso'
            ORDER BY m.Inv_Fecha DESC
        `);

        // Crear nuevo libro y hoja
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Ingresos");

        // Definir encabezados de columna
        worksheet.columns = [
            { header: "ID Movimiento", key: "id", width: 15 },
            { header: "Fecha", key: "fecha", width: 22 },
            { header: "Producto", key: "producto", width: 30 },
            { header: "Tipo de Movimiento", key: "tipo", width: 20 },
            { header: "Cantidad", key: "cantidad", width: 15 },
        ];

        // Agregar filas con datos
        data.forEach((item) => {
            worksheet.addRow({
                id: item.id,
                fecha: item.fecha,
                producto: item.producto,
                tipo: item.tipo,
                cantidad: item.cantidad ?? 0,
            });
        });

        // Aplicar estilos a encabezados
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF2E75B6" }, // azul más oscuro
            };
            cell.alignment = { vertical: "middle", horizontal: "center" };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });

        // Bordes, alineación y altura general
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                };
                cell.alignment = { vertical: "middle", horizontal: "left" };
            });
            if (rowNumber !== 1) row.height = 20;
        });

        // Configurar encabezados HTTP
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=reporte_ingresos.xlsx"
        );

        // Escribir el archivo al response
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error("Error generando Excel de ingresos:", error);
        res.status(500).json({
            message: "Error al generar el Excel de ingresos",
            error: error.message,
        });
    }
});

invExportsRouter.get("/incomecsv", async (req, res) => {
    try {
        // Consulta EXACTA que indicaste
        const data = await query(`
            SELECT 
                m.id_Inv_Movimiento AS id,
                DATE_FORMAT(m.Inv_Fecha, '%Y-%m-%d %H:%i:%s') AS fecha,
                a.Inv_Nombre AS producto,
                m.Inv_TipoMovimiento AS tipo,
                m.Inv_Cantidad AS cantidad
            FROM Inv_Movimiento m
            JOIN Inv_Articulo a ON m.id_Inv_ArticuloFk = a.id_Inv_Articulo
            WHERE m.Inv_EsActivo = 1
              AND m.Inv_TipoMovimiento = 'Ingreso'
            ORDER BY m.Inv_Fecha DESC
        `);

        // Encabezados simples (acorde al SELECT)
        const headers = ["ID Movimiento", "Fecha", "Producto", "Tipo", "Cantidad"];

        // Filas del CSV
        const lines = data.map(item => [
            item.id,
            `"${item.fecha}"`,
            `"${item.producto}"`,
            `"${item.tipo}"`,
            item.cantidad
        ].join(","));

        // Construcción del archivo CSV
        const csvContent = [headers.join(","), ...lines].join("\n");

        // Configurar cabeceras de respuesta
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", "attachment; filename=reporte_ingresos.csv");

        // Enviar resultado
        res.send(csvContent);
    } catch (error) {
        console.error("Error generando CSV de ingresos:", error);
        res.status(500).json({
            message: "Error al generar el CSV de ingresos",
            error: error.message,
        });
    }
});


invExportsRouter.get("/incomejson", async (req, res) => {
    try {
        // Consulta SQL exacta y clara
        const data = await query(`
            SELECT 
                m.id_Inv_Movimiento AS id,
                DATE_FORMAT(m.Inv_Fecha, '%Y-%m-%d %H:%i:%s') AS fecha,
                a.Inv_Nombre AS producto,
                m.Inv_TipoMovimiento AS tipo,
                m.Inv_Cantidad AS cantidad
            FROM Inv_Movimiento m
            JOIN Inv_Articulo a ON m.id_Inv_ArticuloFk = a.id_Inv_Articulo
            WHERE m.Inv_EsActivo = 1
              AND m.Inv_TipoMovimiento = 'Ingreso'
            ORDER BY m.Inv_Fecha DESC
        `);

        // Configurar cabeceras HTTP
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader("Content-Disposition", "attachment; filename=reporte_ingresos.json");

        // Enviar el JSON con formato legible
        res.end(JSON.stringify(data, null, 2));

    } catch (error) {
        console.error("Error generando JSON de ingresos:", error);
        res.status(500).json({
            message: "Error al generar el JSON de ingresos",
            error: error.message,
        });
    }
});

invExportsRouter.get("/incometxt", async (req, res) => {
    try {
        const data = await query(`
            SELECT 
                m.id_Inv_Movimiento AS id,
                DATE_FORMAT(m.Inv_Fecha, '%Y-%m-%d %H:%i:%s') AS fecha,
                a.Inv_Nombre AS producto,
                m.Inv_TipoMovimiento AS tipo,
                m.Inv_Cantidad AS cantidad
            FROM Inv_Movimiento m
            JOIN Inv_Articulo a ON m.id_Inv_ArticuloFk = a.id_Inv_Articulo
            WHERE m.Inv_EsActivo = 1
              AND m.Inv_TipoMovimiento = 'Ingreso'
            ORDER BY m.Inv_Fecha DESC
        `);

        // Encabezados de columnas
        const headers = [
            "ID Movimiento",
            "Fecha",
            "Producto",
            "Tipo de Movimiento",
            "Cantidad",
        ];

        // Crear líneas tabuladas
        const lines = data.map(item =>
            [
                item.id,
                item.fecha,
                item.producto,
                item.tipo,
                item.cantidad ?? 0,
            ].join("\t")
        );

        // Unir encabezado + contenido
        const textContent = [headers.join("\t"), ...lines].join("\n");

        // Configurar respuesta HTTP
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Content-Disposition", "attachment; filename=reporte_ingresos.txt");
        res.send(textContent);

    } catch (error) {
        console.error("Error generando TXT de ingresos:", error);
        res.status(500).json({
            message: "Error al generar el TXT de ingresos",
            error: error.message,
        });
    }
});

invExportsRouter.get("/salidaspdf", async (req, res) => {
    try {
        const data = await query(`
            SELECT 
                m.id_Inv_Movimiento AS id,
                DATE_FORMAT(m.Inv_Fecha, '%Y-%m-%d %H:%i:%s') AS fecha,
                a.Inv_Nombre AS producto,
                m.Inv_TipoMovimiento AS tipo,
                m.Inv_Cantidad AS cantidad
            FROM Inv_Movimiento m
            JOIN Inv_Articulo a ON m.id_Inv_ArticuloFk = a.id_Inv_Articulo
            WHERE m.Inv_EsActivo = 1
              AND m.Inv_TipoMovimiento = 'Salida'
            ORDER BY m.Inv_Fecha DESC
        `);

        const doc = new PDFDocument({ margin: 30, size: "A4" });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=reporte_salidas.pdf");

        doc.pipe(res);

        doc.fontSize(18).text("Reporte de Movimientos - Salidas", { align: "center" });
        doc.moveDown(1.5);

        const table = {
            headers: ["ID Movimiento", "Fecha", "Producto", "Tipo", "Cantidad"],
            rows: data.map((item) => [
                item.id,
                item.fecha,
                item.producto,
                item.tipo,
                item.cantidad ?? 0,
            ]),
        };

        await doc.table(table, {
            prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
            prepareRow: (row, i) => doc.font("Helvetica").fontSize(9),
        });

        doc.end();

    } catch (error) {
        console.error("Error generando PDF de salidas:", error);
        res.status(500).json({
            message: "Error al generar el PDF de salidas",
            error: error.message,
        });
    }
});

invExportsRouter.get("/salidasexcel", async (req, res) => {
    try {
        const data = await query(`
            SELECT 
                m.id_Inv_Movimiento AS id,
                DATE_FORMAT(m.Inv_Fecha, '%Y-%m-%d %H:%i:%s') AS fecha,
                a.Inv_Nombre AS producto,
                m.Inv_TipoMovimiento AS tipo,
                m.Inv_Cantidad AS cantidad
            FROM Inv_Movimiento m
            JOIN Inv_Articulo a ON m.id_Inv_ArticuloFk = a.id_Inv_Articulo
            WHERE m.Inv_EsActivo = 1
              AND m.Inv_TipoMovimiento = 'Salida'
            ORDER BY m.Inv_Fecha DESC
        `);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Salidas");

        worksheet.columns = [
            { header: "ID Movimiento", key: "id", width: 15 },
            { header: "Fecha", key: "fecha", width: 22 },
            { header: "Producto", key: "producto", width: 30 },
            { header: "Tipo de Movimiento", key: "tipo", width: 20 },
            { header: "Cantidad", key: "cantidad", width: 15 },
        ];

        data.forEach((item) => {
            worksheet.addRow(item);
        });

        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFC00000" }, // rojo
            };
            cell.alignment = { vertical: "middle", horizontal: "center" };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });

        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                };
                cell.alignment = { vertical: "middle", horizontal: "left" };
            });
            if (rowNumber !== 1) row.height = 20;
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=reporte_salidas.xlsx"
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error("Error generando Excel de salidas:", error);
        res.status(500).json({
            message: "Error al generar el Excel de salidas",
            error: error.message,
        });
    }
});

invExportsRouter.get("/salidascsv", async (req, res) => {
    try {
        const data = await query(`
            SELECT 
                m.id_Inv_Movimiento AS id,
                DATE_FORMAT(m.Inv_Fecha, '%Y-%m-%d %H:%i:%s') AS fecha,
                a.Inv_Nombre AS producto,
                m.Inv_TipoMovimiento AS tipo,
                m.Inv_Cantidad AS cantidad
            FROM Inv_Movimiento m
            JOIN Inv_Articulo a ON m.id_Inv_ArticuloFk = a.id_Inv_Articulo
            WHERE m.Inv_EsActivo = 1
              AND m.Inv_TipoMovimiento = 'Salida'
            ORDER BY m.Inv_Fecha DESC
        `);

        const headers = ["ID Movimiento", "Fecha", "Producto", "Tipo", "Cantidad"];

        const lines = data.map(item => [
            item.id,
            `"${item.fecha}"`,
            `"${item.producto}"`,
            `"${item.tipo}"`,
            item.cantidad
        ].join(","));

        const csvContent = [headers.join(","), ...lines].join("\n");

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", "attachment; filename=reporte_salidas.csv");

        res.send(csvContent);
    } catch (error) {
        console.error("Error generando CSV de salidas:", error);
        res.status(500).json({
            message: "Error al generar el CSV de salidas",
            error: error.message,
        });
    }
});

invExportsRouter.get("/salidasjson", async (req, res) => {
    try {
        const data = await query(`
            SELECT 
                m.id_Inv_Movimiento AS id,
                DATE_FORMAT(m.Inv_Fecha, '%Y-%m-%d %H:%i:%s') AS fecha,
                a.Inv_Nombre AS producto,
                m.Inv_TipoMovimiento AS tipo,
                m.Inv_Cantidad AS cantidad
            FROM Inv_Movimiento m
            JOIN Inv_Articulo a ON m.id_Inv_ArticuloFk = a.id_Inv_Articulo
            WHERE m.Inv_EsActivo = 1
              AND m.Inv_TipoMovimiento = 'Salida'
            ORDER BY m.Inv_Fecha DESC
        `);

        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader("Content-Disposition", "attachment; filename=reporte_salidas.json");

        res.end(JSON.stringify(data, null, 2));

    } catch (error) {
        console.error("Error generando JSON de salidas:", error);
        res.status(500).json({
            message: "Error al generar el JSON de salidas",
            error: error.message,
        });
    }
});

invExportsRouter.get("/salidastxt", async (req, res) => {
    try {
        const data = await query(`
            SELECT 
                m.id_Inv_Movimiento AS id,
                DATE_FORMAT(m.Inv_Fecha, '%Y-%m-%d %H:%i:%s') AS fecha,
                a.Inv_Nombre AS producto,
                m.Inv_TipoMovimiento AS tipo,
                m.Inv_Cantidad AS cantidad
            FROM Inv_Movimiento m
            JOIN Inv_Articulo a ON m.id_Inv_ArticuloFk = a.id_Inv_Articulo
            WHERE m.Inv_EsActivo = 1
              AND m.Inv_TipoMovimiento = 'Salida'
            ORDER BY m.Inv_Fecha DESC
        `);

        const headers = [
            "ID Movimiento",
            "Fecha",
            "Producto",
            "Tipo de Movimiento",
            "Cantidad",
        ];

        const lines = data.map(item =>
            [
                item.id,
                item.fecha,
                item.producto,
                item.tipo,
                item.cantidad ?? 0,
            ].join("\t")
        );

        const textContent = [headers.join("\t"), ...lines].join("\n");

        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("Content-Disposition", "attachment; filename=reporte_salidas.txt");
        res.send(textContent);

    } catch (error) {
        console.error("Error generando TXT de salidas:", error);
        res.status(500).json({
            message: "Error al generar el TXT de salidas",
            error: error.message,
        });
    }
});
