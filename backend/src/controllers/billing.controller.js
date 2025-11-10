import * as billingModel from '../models/billing.model.js';

// Get products controller
export const getProducts = async (req, res) => {
  try {
    const products = await billingModel.getProducts();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get IVA list
export const getIVAList = async (req, res) => {
  try {
    const iva = await billingModel.getIVAList();
    res.json(iva);
  } catch (error) {
    console.error('Error fetching IVA list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get payment methods
export const getPaymentMethods = async (req, res) => {
  try {
    const methods = await billingModel.getPaymentMethods();
    res.json(methods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Search clients controller
export const searchClients = async (req, res) => {
  const term = req.query.q || '';
  try {
    const clients = await billingModel.searchClients(term);
    res.json(clients);
  } catch (error) {
    console.error('Error searching clients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create invoice controller
export const createInvoice = async (req, res) => {
  const { cliente, billDetail, iva, metodoPagoId, fecha } = req.body;
  if (!cliente || !billDetail || billDetail.length === 0 || !iva || !metodoPagoId || !fecha) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const result = await billingModel.createInvoice(
      { cliente, iva, metodoPagoId, fecha, total: billDetail.reduce((acc, item) => acc + item.subtotal, 0) },
      billDetail
    );
    res.json({ success: true, message: 'Factura creada correctamente', invoiceId: result.invoiceId });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Error creating invoice' });
  }
};

// Get invoices controller
export const getInvoices = async (req, res) => {
  try {
    const invoices = await billingModel.getInvoices();
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
