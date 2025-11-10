import express from 'express';
import * as billingController from '../controllers/billing.controller.js';

export const billingRouter = express.Router();

billingRouter.get('/productos', billingController.getProducts);
billingRouter.get('/iva', billingController.getIVAList);
billingRouter.get('/metodos-pago', billingController.getPaymentMethods);
billingRouter.get('/buscar-cliente', billingController.searchClients);
billingRouter.post('/facturar', billingController.createInvoice);
billingRouter.get('/facturas', billingController.getInvoices);

