import { getPool } from '../config/database.js';

// Get products
export const getProducts = async () => {
  const pool = getPool();
  const [rows] = await pool.query('SELECT id_Inv_Articulo AS id, Inv_Nombre AS nombre, Inv_PrecioUnitario as precio FROM inv_articulo WHERE Inv_EsActivo = 1');
  return rows;
};

// Get IVA list
export const getIVAList = async () => {
  const pool = getPool();
  const [rows] = await pool.query("SELECT Gen_id_iva AS id, CONCAT (Gen_porcentaje, '%') AS descripcion, Gen_porcentaje/100 AS valor FROM gen_iva");
  return rows;
};

// Get payment methods
export const getPaymentMethods = async () => {
  const pool = getPool();
  const [rows] = await pool.query('SELECT Gen_id_metodo_pago AS id, Gen_nombre AS descripcion FROM gen_metodopago');
  return rows;
};

// Search clients by term in name or cedula
export const searchClients = async (term) => {
  const pool = getPool();
  const likeTerm = `%${term.toLowerCase()}%`;
  const [rows] = await pool.query(
    `SELECT id_Clientes AS id, CONCAT (Cli_Nombres, ' ', Cli_Apellidos) AS nombre, Cli_Identificacion AS cedula, Cli_Telefono AS telefono
     FROM clientes 
     WHERE LOWER(Cli_Nombres) LIKE ? OR Cli_Identificacion LIKE ? OR LOWER(Cli_Apellidos) LIKE ?`,
    [likeTerm, likeTerm, likeTerm]
  );
  return rows;
};

// Create a new invoice with details inside a transaction
export const createInvoice = async (invoice, details) => {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    // Insert invoice
    const [invoiceResult] = await connection.query(
      `INSERT INTO fac_factura (id_modulo_origen, id_cli_clienteFk, fac_fecha, id_gen_metodoPagoFk, id_gen_ivaFk, fac_total)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        6, // assuming module origin fixed for billing module
        invoice.cliente.id, // if you have client id, otherwise null or handle differently
        invoice.fecha,
        invoice.metodoPagoId,
        invoice.iva.id,
        invoice.total || 0
      ]
    );
    const invoiceId = invoiceResult.insertId;

    // Insert details
    for (const item of details) {
      await connection.query(
        `INSERT INTO fac_detallefactura (id_fac_facturaFk, id_modulo_origen, id_inv_articuloFk, fac_cantidad, fac_preccioUnitario, fac_subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          invoiceId,
          6, // same module origin
          item.itemId,
          item.cantidad,
          item.precioUnitario,
          item.subtotal,
        ]
      );
    }

    await connection.commit();
    return { success: true, invoiceId };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Get invoices with client info and totals
export const getInvoices = async () => {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT 
      f.id_fac_factura AS id,
      CONCAT (c.Cli_Nombres, ' ', c.Cli_Apellidos) AS clienteNombre,
      c.Cli_Identificacion AS clienteCedula,
      f.fac_fecha AS fecha,
      f.fac_total AS total
    FROM fac_factura f
    JOIN clientes c ON f.id_cli_clienteFk = c.id_Clientes
    ORDER BY f.fac_fecha DESC`
  );

  // Map rows to desired format
  return rows.map(r => ({
    id: r.id,
    cliente: { nombre: r.clienteNombre, cedula: r.clienteCedula },
    fecha: r.fecha,
    total: parseFloat(r.total)
  }));
};
