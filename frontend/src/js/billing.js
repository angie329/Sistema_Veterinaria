import { createIcons, icons } from "lucide";

import { config } from "@/config/env.js";

const API_BASE_URL = "http://localhost:3008/v1/billing";

const iconConfig = {
  icons: {
    LayoutDashboard: icons.LayoutDashboard,
    Users: icons.Users,
    Dog: icons.Dog,
    Stethoscope: icons.Stethoscope,
    Calendar: icons.Calendar,
    CalendarX: icons.CalendarX,
    Package: icons.Package,
    Receipt: icons.Receipt,
    Settings: icons.Settings,
    Search: icons.Search,
    Bell: icons.Bell,
    ChevronDown: icons.ChevronDown,
    Clock: icons.Clock,
    Menu: icons.Menu,
    X: icons.X,
    CalendarClock: icons.CalendarClock,
    Activity: icons.Activity,
    UserPlus: icons.UserPlus,
    DollarSign: icons.DollarSign,
    AlertTriangle: icons.AlertTriangle,
    CheckCircle: icons.CheckCircle,
    XCircle: icons.XCircle,
    Trash: icons.Trash,
  },
};



function highlightActive() {
  const currentPath = window.location.pathname;
  document.querySelectorAll(".sidebar-nav-item").forEach((a) => {
    const href = a.getAttribute("href");
    a.classList.toggle(
      "sidebar-nav-item-active",
      href === currentPath || (href.endsWith("facturacion.html"))
    );
  });
}

function initMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const sidebar = document.getElementById("sidebar");
  const overlay =
    document.getElementById("sidebarOverlay") ||
    document.querySelector(".sidebar-overlay");

  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener("click", () => {
      sidebar.classList.toggle("sidebar-open");
      if (overlay) {
        overlay.classList.toggle("overlay-visible");
      }
    });
  }

  if (overlay) {
    overlay.addEventListener("click", () => {
      sidebar.classList.remove("sidebar-open");
      overlay.classList.remove("overlay-visible");
    });
  }

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      sidebar.classList.remove("sidebar-open");
      if (overlay) {
        overlay.classList.remove("overlay-visible");
      }
    }
  });
}

async function cargarDatosIniciales(){
  const products = await fetch (`${API_BASE_URL}/productos`).then(res => res.json());
  const ivaList = await fetch(`${API_BASE_URL}/iva`).then(res => res.json());
  const payMethods = await fetch(`${API_BASE_URL}/metodos-pago`).then(res => res.json());

  const selItem = document.getElementById('selectItem');
  products.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.id;
    opt.textContent = `${item.nombre} - $${parseFloat(item.precio).toFixed(2)}`;
    opt.dataset.precio = item.precio;
    selItem.appendChild(opt);
  });

  const selIva = document.getElementById('iva');
  ivaList.forEach(tax => {
    const opt = document.createElement('option');
    opt.value = tax.id;
    opt.textContent = tax.descripcion;
    opt.dataset.valor = tax.valor; 
    selIva.appendChild(opt);
    console.log(ivaList);
  });

  const selPay = document.getElementById('payment');
  payMethods.forEach(metodo => {
    const opt = document.createElement('option');
    opt.value = metodo.id;
    opt.textContent = metodo.descripcion;
    selPay.appendChild(opt);
  });

}


async function buscarCliente(){
  const searchTerm = document.getElementById('txtSearch').value.trim();
  if(!searchTerm){
    alert('Ingrese un termino para buscar.');
    return; 
  }

  const res = await fetch(`${API_BASE_URL}/buscar-cliente?q=${encodeURIComponent(searchTerm)}`);
  const clientes = await res.json();

  const resulClient = document.getElementById('resultadoClientes');
  resulClient.innerHTML = '';

  if (clientes.length === 0){
    resulClient.textContent = 'No se han encontrado clientes';
    return;
  }

  clientes.forEach(cl => {
    const div = document.createElement('div');
    div.textContent = `${cl.nombre} - ${cl.cedula}`;
    div.classList.add('result-item');
    div.addEventListener('click',() => {
      document.getElementById('txtClient').value = cl.id;
      document.getElementById('TxtName').value = cl.nombre;
      document.getElementById('txtID').value = cl.cedula;
      document.getElementById('txtTlf').value = cl.telefono;
      resulClient.innerHTML = '';
    });
    resulClient.appendChild(div);
  });
}

async function addProduct(){
  const selectItem = document.getElementById('selectItem');
  const cantInput = document.getElementById('cantidadItem');
  const billDetail = document.getElementById('detalleFactura');

  const itemId = selectItem.value;
  if (!itemId) {
    alert('Selecciona un producto o servicio');
    return;
  }

  const cantidad = parseInt(cantInput.value);
  if (isNaN(cantidad) || cantidad < 1) {
    alert('Ingrese una cantidad válida');
    return;
  }

  const theOpt = selectItem.options[selectItem.selectedIndex];
  const nombre = theOpt.textContent.split(' - $')[0];
  const unitPrice = parseFloat(theOpt.dataset.precio);

  const tr = document.createElement('tr');
  tr.dataset.itemId = itemId;

  tr.innerHTML = `
    <td>${nombre}</td>
    <td>${cantidad}</td>
    <td>$${unitPrice.toFixed(2)}</td>
    <td>$${(unitPrice * cantidad).toFixed(2)}</td>
    <td class="btnCell"><button type="button" class="btn btn-remove" aria-label="Eliminar">
    <svg xmlns="http://www.w3.org/2000/svg"
    width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
    class="lucide lucide-trash-icon lucide-trash">
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
    <path d="M3 6h18"/>
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
    </button></td>
  `;

  tr.querySelector('.btn-remove').addEventListener('click', () => {
    tr.remove();
    updateTotal();
  });

  billDetail.appendChild(tr);
  updateTotal();
}

function updateTotal(){
  const billDetail = document.getElementById('detalleFactura');
  let subtotal = 0;
  billDetail.querySelectorAll('tr').forEach(tr => {
    const subtotalStr = tr.children[3].textContent.replace('$','');
    subtotal += parseFloat(subtotalStr);
  });

  document.getElementById('subTotalBill').textContent = `Subtotal a pagar: $${subtotal.toFixed(2)}`;

  const ivaSelect = document.getElementById('iva');
  const ivaValue = parseFloat(ivaSelect.selectedOptions[0].dataset.valor) || 0; 
  const total = subtotal + subtotal * ivaValue;
  document.getElementById('totalBill').textContent = `Total a pagar: $${total.toFixed(2)}`;
}

async function sendBill(){
  const cliente = {
    id: document.getElementById('txtClient').value,
    nombre: document.getElementById('TxtName').value.trim(),
    cedula: document.getElementById('txtID').value.trim(),
    telefono: document.getElementById('txtTlf').value.trim()
  };

  const billDetail = [];
  const rowDetail = document.getElementById('detalleFactura').querySelectorAll('tr');
  rowDetail.forEach(tr =>{
    billDetail.push({
      itemId: tr.dataset.itemId,
      nombre: tr.children[0].textContent,
      cantidad: parseInt(tr.children[1].textContent),
      precioUnitario: parseFloat(tr.children[2].textContent.replace('$','')),
      subtotal: parseFloat(tr.children[3].textContent.replace('$','')) 
    });
  });

  const ivaSelect = document.getElementById('iva');
  const paySelect = document.getElementById('payment');

  if(!cliente.nombre || !cliente.cedula || billDetail.length === 0 || !ivaSelect.value || !paySelect.value){
    alert('Por favor, complete todos los campos y agregue al menos un producto o servicio');
    return false;
  }

  const bill = {
    cliente,
    billDetail,
    iva: {
      id: parseInt(ivaSelect.value),
      descripcion: ivaSelect.options[ivaSelect.selectedIndex].textContent
    },
    metodoPagoId: parseInt(paySelect.value),
    fecha: new Date().toISOString().slice(0, 19).replace('T', ' ')
  };

  try {
    console.log('Enviando factura...',bill);
    const res = await fetch(`${API_BASE_URL}/facturar`,{
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(bill)
    });
    const data = await res.json();
    console.log('Respuesta recibida', data);
    alert(data.message || 'Factura enviada correctamente');

    document.getElementById('billingForm').reset();
    document.getElementById('detalleFactura').innerHTML='';
    document.getElementById('resultadoClientes').innerHTML='';
    updateTotal();
    return false;
  }
  catch(error){
    console.error('Error al enviar la factura: ', error);
    alert('Error al enviar factura');
    return false;
  }

}

async function loadInvoices() {
  const res = await fetch(`${API_BASE_URL}/facturas`);
  const facturas = await res.json();

  const list = document.getElementById('invoicesList');
  list.innerHTML = '';

  facturas.forEach(invoice => {
    const li = document.createElement('li');
    li.textContent = `ID: ${invoice.id},
    Cliente: ${invoice.cliente.nombre},
    Fecha: ${new Date(invoice.fecha).toLocaleDateString()},
    Total: $${invoice.total.toFixed(2)}`;
    list.appendChild(li);
  });
}

async function loadBilling(){
  createIcons(iconConfig);

  cargarDatosIniciales();
  loadInvoices();
}





function initModule() {
  highlightActive();
  initMobileMenu();
  loadBilling();
  document.getElementById('btnSearch').addEventListener('click', buscarCliente);
  document.getElementById('btnItem').addEventListener('click', addProduct);
  document.getElementById('iva').addEventListener('change', updateTotal); 
  document.getElementById('billingForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // evitar recarga
    await sendBill();
  });
}

document.addEventListener("DOMContentLoaded", initModule);
