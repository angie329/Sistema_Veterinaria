import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { createIcons, icons } from "lucide";

const iconConfig = {
  icons: {
    LayoutDashboard: icons.LayoutDashboard,
    Users: icons.Users,
    Dog: icons.Dog,
    Stethoscope: icons.Stethoscope,
    Calendar: icons.Calendar,
    Package: icons.Package,
    Receipt: icons.Receipt,
    Settings: icons.Settings,
    Search: icons.Search,
    Bell: icons.Bell,
    ChevronDown: icons.ChevronDown,
    PlusCircle: icons.PlusCircle,
    Menu: icons.Menu,
    Table: icons.Table,
    UserPlus: icons.UserPlus,
    CheckCircle: icons.CheckCircle,
    MapPin: icons.MapPin,
    FileText: icons.FileText,
    User: icons.User,
    Phone: icons.Phone,
    Percent: icons.Percent,
    Ruler: icons.Ruler,
    CreditCard: icons.CreditCard,
    Building2: icons.Building2,
    Edit: icons.Edit,
    Trash2: icons.Trash2,
    File: icons.File,
    Braces: icons.Braces,
  },
};

function highlightActive() {
  const currentPath = window.location.pathname;
  document.querySelectorAll(".sidebar-nav-item").forEach((a) => {
    const href = a.getAttribute("href");
    a.classList.toggle(
      "sidebar-nav-item-active",
      href === currentPath ||
        (currentPath === "/clients.html" && href === "/clients")
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

const API_URL = "http://localhost:3008/v1/api/clientes";

async function cargarClientes() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Error al obtener clientes");

    const clientes = await response.json();
    const tbody = document.getElementById("clientes-body");

    if (!tbody) return; // evita errores si no estás en la página de clientes

    tbody.innerHTML = "";

    clientes.forEach((cliente) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${cliente.id_Clientes}</td>
        <td>${cliente.Cli_Identificacion}</td>
        <td>${cliente.Cli_Nombres}</td>
        <td>${cliente.Cli_Apellidos || ""}</td>
        <td>${cliente.Cli_Telefono}</td>
        <td>${cliente.Cli_Email}</td>
        <td>${cliente.Cli_DireccionDetalle}</td>
        <td>${new Date(cliente.Cli_FechaRegistro).toLocaleDateString(
          "es-EC"
        )}</td>
        <td>
          <div class="table-actions">
            <button class="btn-edit" data-id="${
              cliente.id_Clientes
            }" title="Editar">
              <i data-lucide="edit"></i>
            </button>
            <button class="btn-delete" data-id="${
              cliente.id_Clientes
            }" title="Eliminar">
              <i data-lucide="trash2"></i>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(fila);
    });

    createIcons(iconConfig);

    // Asignar eventos a los botones después de renderizar
    document.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.id;
        eliminarCliente(id);
      });
    });

    document.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.id;
        const cliente = clientes.find((c) => c.id_Clientes == id);
        llenarFormulario(cliente);
      });
    });
  } catch (error) {
    console.error("Error cargando clientes:", error);
  }
}

async function crearCliente(cliente) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente),
  });
  if (!response.ok) throw new Error("Error al crear cliente");
  return response.json();
}

// Actualizar cliente (PUT)
async function actualizarCliente(id, cliente) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente),
  });
  if (!response.ok) throw new Error("Error al actualizar cliente");
  return response.json();
}

// Eliminar cliente (DELETE lógico)
async function eliminarCliente(id) {
  if (!confirm("¿Seguro que deseas eliminar este cliente?")) return;
  const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Error al eliminar cliente");
  alert("Cliente eliminado correctamente");
  cargarClientes();
}

function llenarFormulario(cliente) {
  document.getElementById("cliente-id").value = cliente.id_Clientes;
  document.getElementById("Cli_Identificacion").value =
    cliente.Cli_Identificacion;
  document.getElementById("Cli_Nombres").value = cliente.Cli_Nombres;
  document.getElementById("Cli_Apellidos").value = cliente.Cli_Apellidos;
  document.getElementById("Cli_Telefono").value = cliente.Cli_Telefono;
  document.getElementById("Cli_Email").value = cliente.Cli_Email;
  document.getElementById("Cli_DireccionDetalle").value =
    cliente.Cli_DireccionDetalle;
}

document
  .getElementById("cliente-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("cliente-id").value;

    const nuevoCliente = {
      Cli_Identificacion: document.getElementById("Cli_Identificacion").value,
      Cli_Nombres: document.getElementById("Cli_Nombres").value,
      Cli_Apellidos: document.getElementById("Cli_Apellidos").value,
      Cli_Telefono: document.getElementById("Cli_Telefono").value,
      Cli_Email: document.getElementById("Cli_Email").value,
      Cli_DireccionDetalle: document.getElementById("Cli_DireccionDetalle")
        .value,
    };

    try {
      if (id) {
        await actualizarCliente(id, nuevoCliente);
        alert("Cliente actualizado correctamente");
      } else {
        await crearCliente(nuevoCliente);
        alert("Cliente agregado correctamente");
      }
      e.target.reset();
      document.getElementById("cliente-id").value = "";
      cargarClientes();
    } catch (error) {
      alert("Error al guardar cliente");
      console.error(error);
    }
  });

/* ========== FUNCIONES DE EXPORTACIÓN ========== */
function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatDateExport(dateString) {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleString("es-EC");
  } catch {
    return String(dateString);
  }
}

async function exportClientes(type) {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const clientes = await response.json();

    if (!Array.isArray(clientes) || clientes.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const fileName = `reporte_clientes`;

    switch (type) {
      case "json": {
        downloadFile(
          new Blob([JSON.stringify(clientes, null, 2)], {
            type: "application/json",
          }),
          `${fileName}.json`
        );
        break;
      }

      case "pdf": {
        const doc = new jsPDF();
        doc.text("Reporte de Clientes", 14, 15);

        const headers = [
          "ID",
          "Identificación",
          "Nombres",
          "Apellidos",
          "Teléfono",
          "Email",
          "Dirección",
          "Fecha Registro",
        ];

        const body = clientes.map((cliente) => [
          cliente.id_Clientes || "",
          cliente.Cli_Identificacion || "",
          cliente.Cli_Nombres || "",
          cliente.Cli_Apellidos || "",
          cliente.Cli_Telefono || "",
          cliente.Cli_Email || "",
          cliente.Cli_DireccionDetalle || "",
          cliente.Cli_FechaRegistro
            ? formatDateExport(cliente.Cli_FechaRegistro)
            : "",
        ]);

        autoTable(doc, {
          startY: 20,
          head: [headers],
          body: body,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [16, 185, 129] },
        });

        doc.save(`${fileName}.pdf`);
        break;
      }

      default:
        throw new Error(`Tipo de exportación no soportado: ${type}`);
    }
  } catch (error) {
    console.error("Error al exportar:", error);
    alert("Error al generar el reporte.");
  }
}

function initClientesExport() {
  const btnJSON = document.getElementById("btnExportClientesJSON");
  const btnPDF = document.getElementById("btnExportClientesPDF");

  if (btnJSON) {
    btnJSON.addEventListener("click", () => exportClientes("json"));
  }

  if (btnPDF) {
    btnPDF.addEventListener("click", () => exportClientes("pdf"));
  }
}

async function initDashboard() {
  highlightActive();
  initMobileMenu();
  await cargarClientes();
  initClientesExport();
  createIcons(iconConfig);
}

// Ejecutar automáticamente cuando se cargue la página
document.addEventListener("DOMContentLoaded", initDashboard);
