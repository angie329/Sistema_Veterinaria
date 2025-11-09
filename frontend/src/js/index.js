import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { createIcons, icons } from "lucide";

import { config } from "@/config/env.js";

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
    MapPin: icons.MapPin,
    FileText: icons.FileText,
    User: icons.User,
    Phone: icons.Phone,
    Percent: icons.Percent,
    Ruler: icons.Ruler,
    CreditCard: icons.CreditCard,
    Building2: icons.Building2,
    Plus: icons.Plus,
    PlusCircle: icons.PlusCircle,
    Pencil: icons.Pencil,
    Trash: icons.Trash,
    FileSpreadsheet: icons.FileSpreadsheet,
    FileCode: icons.FileCode,
    Braces: icons.Braces,
    File: icons.File,
    Save: icons.Save,
    Edit: icons.Edit,
    Trash2: icons.Trash2,
  },
};

function highlightActive() {
  const currentPath = window.location.pathname;
  document.querySelectorAll(".sidebar-nav-item").forEach((a) => {
    const href = a.getAttribute("href");
    a.classList.toggle(
      "sidebar-nav-item-active",
      href === currentPath || (currentPath === "/index.html" && href === "/")
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

function formatDate() {
  const today = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return today.toLocaleDateString("es-ES", options);
}

function renderMetrics(data) {
  const metricsGrid = document.getElementById("metricsGrid");
  if (!metricsGrid) return;

  const metrics = [
    {
      title: "Total Clientes",
      value: data.metrics.totalClients,
      icon: "users",
      iconClass: "icon-primary",
    },
    {
      title: "Total Mascotas",
      value: data.metrics.totalPets,
      icon: "dog",
      iconClass: "icon-secondary",
    },
    {
      title: "Veterinarios Activos",
      value: data.metrics.activeVeterinarians,
      icon: "stethoscope",
      iconClass: "icon-primary",
    },
    {
      title: "Citas Pendientes",
      value: data.metrics.pendingAppointments,
      icon: "clock",
      iconClass: "icon-warning",
    },
  ];

  metricsGrid.innerHTML = metrics
    .map(
      (metric) => `
    <div class="metric-card">
      <div class="metric-card-header">
        <h3 class="metric-card-title">${metric.title}</h3>
        <div class="metric-card-icon ${metric.iconClass}">
          <i data-lucide="${metric.icon}"></i>
        </div>
      </div>
      <p class="metric-card-value">${metric.value}</p>
    </div>
  `
    )
    .join("");
}

function renderAppointments(data) {
  const appointmentsList = document.getElementById("appointmentsList");
  if (!appointmentsList) return;

  if (!data.upcomingAppointments || data.upcomingAppointments.length === 0) {
    appointmentsList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <i data-lucide="calendar-x"></i>
        </div>
        <p class="empty-state-message">No hay citas programadas para hoy</p>
      </div>
    `;
    createIcons(iconConfig);
    return;
  }

  appointmentsList.innerHTML = data.upcomingAppointments
    .map(
      (appointment) => `
    <li class="appointment-item">
      <div class="appointment-time">${appointment.time || "—"}</div>
      <div class="appointment-details">
        <div class="appointment-reason">${
          appointment.reason || "Sin motivo"
        }</div>
      </div>
    </li>
  `
    )
    .join("");
  createIcons(iconConfig);
}

async function loadDashboard() {
  try {
    const API_URL = `${config.BACKEND_URL}/v1/dashboard`;
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    const dashboardDate = document.getElementById("dashboardDate");
    if (dashboardDate) {
      dashboardDate.textContent = formatDate();
    }

    try {
      renderMetrics(data);
    } catch (error) {
      console.error("Error rendering metrics:", error);
    }

    try {
      renderAppointments(data);
    } catch (error) {
      console.error("Error rendering appointments:", error);
    }

    createIcons(iconConfig);
  } catch (error) {
    console.error("Error loading dashboard:", error);
    const metricsGrid = document.getElementById("metricsGrid");
    if (metricsGrid) {
      metricsGrid.innerHTML = `
        <div class="empty-state">
          <p class="empty-state-message">Error al cargar los datos del dashboard: ${error.message}</p>
        </div>
      `;
    }
  }
}

// Proveedores CRUD
let editingProveedorId = null;

async function loadProveedores() {
  const container = document.getElementById("table-proveedores");
  if (!container) return;

  container.innerHTML = "<div class='loading'>Cargando...</div>";

  try {
    const API_URL = `${config.BACKEND_URL}/v1/proveedores`;
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    if (data.length === 0) {
      container.innerHTML =
        "<div class='empty-state'><p class='empty-state-message'>No hay proveedores</p></div>";
      return;
    }

    const tableHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              (row) => `
            <tr>
              <td>${row.Gen_nombre || ""}</td>
              <td>${row.Gen_telefono || ""}</td>
              <td>${row.Gen_email || ""}</td>
              <td>
                <div class="table-actions">
                  <button class="btn btn-sm btn-primary" onclick="editProveedor('${
                    row.Gen_id_proveedor
                  }')">
                    <i data-lucide="edit"></i> Editar
                  </button>
                  <button class="btn btn-sm btn-danger" onclick="deleteProveedor('${
                    row.Gen_id_proveedor
                  }')">
                    <i data-lucide="trash2"></i> Eliminar
                  </button>
                </div>
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
    container.innerHTML = tableHTML;
    createIcons(iconConfig);
  } catch (error) {
    console.error("Error loading proveedores:", error);
    container.innerHTML = `<div class='empty-state'><p class='empty-state-message'>Error: ${error.message}</p></div>`;
  }
}

function openProveedorModal() {
  editingProveedorId = null;
  const modal = document.getElementById("modal-proveedores");
  const title = document.getElementById("modal-title-proveedores");
  const form = document.getElementById("form-proveedores");

  if (title) {
    title.textContent = "Nuevo Proveedor";
  }

  if (form) {
    form.reset();
  }

  if (modal) {
    modal.showModal();
    createIcons(iconConfig);
  }
}

async function editProveedor(id) {
  try {
    const API_URL = `${config.BACKEND_URL}/v1/proveedores/${id}`;
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    editingProveedorId = id;
    const modal = document.getElementById("modal-proveedores");
    const title = document.getElementById("modal-title-proveedores");
    const form = document.getElementById("form-proveedores");

    if (title) {
      title.textContent = "Editar Proveedor";
    }

    if (form) {
      Object.keys(data).forEach((key) => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) {
          input.value = data[key] || "";
        }
      });
    }

    if (modal) {
      modal.showModal();
      createIcons(iconConfig);
    }
  } catch (error) {
    console.error("Error loading proveedor:", error);
    alert(`Error: ${error.message}`);
  }
}

async function deleteProveedor(id) {
  if (!confirm("¿Está seguro de eliminar este proveedor?")) return;

  try {
    const API_URL = `${config.BACKEND_URL}/v1/proveedores/${id}`;
    const response = await fetch(API_URL, { method: "DELETE" });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    loadProveedores();
    alert("Eliminado correctamente");
  } catch (error) {
    console.error("Error deleting proveedor:", error);
    alert(`Error: ${error.message}`);
  }
}

async function handleProveedorSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const data = {};

  for (const [key, value] of formData.entries()) {
    data[key] = value || null;
  }

  data.Gen_modulo_origen = 1;
  data.Gen_id_estado_general = 1;
  if (!data.Gen_producto_servicio) data.Gen_producto_servicio = "";

  try {
    const API_URL = `${config.BACKEND_URL}/v1/proveedores${
      editingProveedorId ? `/${editingProveedorId}` : ""
    }`;
    const method = editingProveedorId ? "PUT" : "POST";

    const response = await fetch(API_URL, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const wasEditing = !!editingProveedorId;
    const modal = document.getElementById("modal-proveedores");
    if (modal) {
      modal.close();
    }

    editingProveedorId = null;
    form.reset();
    loadProveedores();
    alert(wasEditing ? "Actualizado correctamente" : "Creado correctamente");
  } catch (error) {
    console.error("Error saving proveedor:", error);
    alert(`Error: ${error.message}`);
  }
}

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

function convertToCSV(records) {
  if (!records || records.length === 0) return "";
  const headers = Object.keys(records[0]);
  const rows = records.map((obj) =>
    headers
      .map((header) => {
        const value = obj[header];
        if (value === null || value === undefined) return "";
        const stringValue = String(value).replace(/"/g, '""');
        return stringValue.includes(",") || stringValue.includes('"')
          ? `"${stringValue}"`
          : stringValue;
      })
      .join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

function formatDateExport(dateString) {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleString("es-EC");
  } catch {
    return String(dateString);
  }
}

async function exportData(apiUrl, entityName, type, options = {}) {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    const records = data.data || data;

    if (!Array.isArray(records) || records.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const fileName = `reporte_${entityName}`;

    switch (type) {
      case "json": {
        downloadFile(
          new Blob([JSON.stringify(records, null, 2)], {
            type: "application/json",
          }),
          `${fileName}.json`
        );
        break;
      }

      case "csv": {
        const csv = convertToCSV(records);
        downloadFile(
          new Blob([csv], { type: "text/csv;charset=utf-8;" }),
          `${fileName}.csv`
        );
        break;
      }

      case "xlsx": {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(records);
        XLSX.utils.book_append_sheet(
          wb,
          ws,
          entityName.charAt(0).toUpperCase() + entityName.slice(1)
        );
        XLSX.writeFile(wb, `${fileName}.xlsx`);
        break;
      }

      case "pdf": {
        const doc = new jsPDF();
        doc.text(
          `Reporte de ${
            entityName.charAt(0).toUpperCase() + entityName.slice(1)
          }`,
          14,
          15
        );

        const headers = options.pdfHeaders || Object.keys(records[0]);
        const body = records.map((record) => {
          if (options.pdfRowMapper) {
            return options.pdfRowMapper(record);
          }
          return headers.map((header) => {
            const value = record[header];
            if (value === null || value === undefined) return "";
            if (typeof value === "object") return JSON.stringify(value);
            if (
              typeof value === "string" &&
              value.includes("T") &&
              value.includes("Z")
            ) {
              return formatDateExport(value);
            }
            return String(value);
          });
        });

        autoTable(doc, {
          startY: 20,
          head: [headers],
          body: body,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [66, 139, 202] },
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

// Función genérica para inicializar exportación de entidades
function initEntityExport(entityName, apiUrl, pdfOptions = null) {
  const btnCSV = document.getElementById(`btnExport${entityName}CSV`);
  const btnJSON = document.getElementById(`btnExport${entityName}JSON`);
  const btnPDF = document.getElementById(`btnExport${entityName}PDF`);
  const btnXLSX = document.getElementById(`btnExport${entityName}XLSX`);

  if (btnCSV) {
    btnCSV.addEventListener("click", () => {
      exportData(apiUrl, entityName.toLowerCase(), "csv", pdfOptions);
    });
  }

  if (btnJSON) {
    btnJSON.addEventListener("click", () => {
      exportData(apiUrl, entityName.toLowerCase(), "json");
    });
  }

  if (btnPDF) {
    btnPDF.addEventListener("click", () => {
      exportData(apiUrl, entityName.toLowerCase(), "pdf", pdfOptions);
    });
  }

  if (btnXLSX) {
    btnXLSX.addEventListener("click", () => {
      exportData(apiUrl, entityName.toLowerCase(), "xlsx");
    });
  }
}

// Exportación de Proveedores
function initProveedoresExport() {
  const API_URL = `${config.BACKEND_URL}/v1/proveedores`;
  const pdfOptions = {
    pdfHeaders: [
      "ID",
      "Nombre",
      "Dirección",
      "Teléfono",
      "Email",
      "Producto/Servicio",
    ],
    pdfRowMapper: (row) => [
      row.Gen_id_proveedor,
      row.Gen_nombre || "",
      row.Gen_direccion || "",
      row.Gen_telefono || "",
      row.Gen_email || "",
      row.Gen_producto_servicio || "",
    ],
  };

  initEntityExport("Proveedores", API_URL, pdfOptions);
}

window.openProveedorModal = openProveedorModal;
window.editProveedor = editProveedor;
window.deleteProveedor = deleteProveedor;
window.handleProveedorSubmit = handleProveedorSubmit;

function initDashboard() {
  highlightActive();
  initMobileMenu();
  loadDashboard();
  loadProveedores();
  initProveedoresExport();
}

document.addEventListener("DOMContentLoaded", initDashboard);
