export const getProducts = (req, res) => {
    // 1. Leer los parámetros de la URL 
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchTerm = req.query.search || '';

    // 2. Lógica para obtener los datos 
    const mockProducts = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `Producto de Prueba ${i + 1}`,
        type: 'Medicamento',
        unit: 'Caja',
        cantUnidadMedida: 10,
        iva: 12,
        price: 19.99 + i,
        stock: 50 - i,
        category: 'Analgésicos'
    }));

    const totalProducts = mockProducts.length;
    const totalPages = Math.ceil(totalProducts / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const productsForPage = mockProducts.slice(startIndex, endIndex);

    // 3. Enviar la respuesta en el formato que el frontend espera
    res.json({
        products: productsForPage,
        totalPages: totalPages,
        currentPage: page
    });
};
