import express from "express";
export const billingRouter = express.Router();

// ===== DATOS SIMULADOS ===== //
const clients = [
  { id: 1, nombre: "Juan Pérez", cedula: "0102030405", telefono: "0987654321" },
  { id: 2, nombre: "María García", cedula: "1122334455", telefono: "0965432187" },
  { id: 3, nombre: "Juan Rodríguez", cedula: "0987654321", telefono: "0987798556" },
];

const products = [
  { id: 10, nombre: "Consulta Veterinaria", precio: 15.00 },
  { id: 11, nombre: "Vacuna Triple Felina", precio: 25.50 },
  { id: 12, nombre: "Desparasitación", precio: 12.75 }
];

const ivaList = [
  { id: 1, descripcion: "0%", valor: 0.00 },
  { id: 2, descripcion: "12%", valor: 0.12 },
  { id: 3, descripcion: "8%", valor: 0.08 },
  { id: 4, descripcion: "15%", valor: 0.15 }
];

const paymentMethods = [
  { id: 1, descripcion: "Efectivo" },
  { id: 2, descripcion: "Tarjeta" },
  { id: 3, descripcion: "Transferencia" }
];

const invoices = [
  { id: 1, cliente: {nombre: "Juan Pérez", cedula: "0102030405" }, fecha: "2025-11-01T00:00:00Z", total: 100.50 },
  { id: 2, cliente: {nombre: "María García", cedula: "1122334455" }, fecha: "2025-11-05T12:36:00Z", total: 75.00 }
];

// ===== RUTAS ===== //

// Obtener productos
billingRouter.get("/productos", (req, res) => {
  return res.json(products);
});

// Obtener IVA
billingRouter.get("/iva", (req, res) => {
  return res.json(ivaList);
});

// Obtener métodos de pago
billingRouter.get("/metodos-pago", (req, res) => {
  return res.json(paymentMethods);
});

// Buscar cliente
billingRouter.get("/buscar-cliente", (req, res) => {
  const term = (req.query.q || "").toLowerCase();
  const results = clients.filter(c =>
    c.nombre.toLowerCase().includes(term) ||
    c.cedula.includes(term)
  );
  return res.json(results);
});

// Recibir factura generada
billingRouter.post("/facturar", (req, res) => {
  console.log("Factura recibida (simulada):");
  console.log(req.body);

  return res.json({
    success: true,
    message: "Factura simulada correctamente"
  });
});

//Observar facturas anteriores
billingRouter.get("/facturas",(req, res) =>{
  res.json(invoices);
});

