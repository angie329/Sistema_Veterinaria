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

function formatCurrency(amount) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

  if (diffInHours < 1) {
    return "Hace unos minutos";
  } else if (diffInHours < 24) {
    return `Hace ${diffInHours} hora${diffInHours > 1 ? "s" : ""}`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays} día${diffInDays > 1 ? "s" : ""}`;
  }
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
      title: "Citas Hoy",
      value: data.metrics.todayAppointments,
      icon: "calendar",
      iconClass: "icon-success",
    },
    {
      title: "Citas Pendientes",
      value: data.metrics.pendingAppointments,
      icon: "clock",
      iconClass: "icon-warning",
    },
    {
      title: "Ingresos del Mes",
      value: formatCurrency(data.metrics.monthlyRevenue),
      icon: "dollar-sign",
      iconClass: "icon-success",
    },
    {
      title: "Veterinarios Activos",
      value: data.metrics.activeVeterinarians,
      icon: "stethoscope",
      iconClass: "icon-primary",
    },
    {
      title: "Alertas de Inventario",
      value: data.metrics.lowStockAlerts,
      icon: "package",
      iconClass: "icon-error",
    },
    {
      title: "Citas Completadas",
      value: data.metrics.completedAppointments,
      icon: "check-circle",
      iconClass: "icon-success",
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

  if (data.upcomingAppointments.length === 0) {
    appointmentsList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <i data-lucide="calendar-x"></i>
        </div>
        <p class="empty-state-message">No hay citas programadas</p>
      </div>
    `;
    return;
  }

  appointmentsList.innerHTML = data.upcomingAppointments
    .map(
      (appointment) => `
    <li class="appointment-item">
      <div class="appointment-time">${appointment.time}</div>
      <div class="appointment-details">
        <div class="appointment-pet">${appointment.petName} - ${
        appointment.petType
      }</div>
        <div class="appointment-client">${appointment.clientName}</div>
        <div class="appointment-reason">${appointment.reason} • ${
        appointment.veterinarian
      }</div>
      </div>
      <span class="appointment-status status-${appointment.status}">${
        appointment.status === "confirmed" ? "Confirmada" : "Pendiente"
      }</span>
    </li>
  `
    )
    .join("");
}

function renderActivity(data) {
  const activityList = document.getElementById("activityList");
  if (!activityList) return;

  if (data.recentActivity.length === 0) {
    activityList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <i data-lucide="activity"></i>
        </div>
        <p class="empty-state-message">No hay actividad reciente</p>
      </div>
    `;
    return;
  }

  activityList.innerHTML = data.recentActivity
    .map(
      (activity) => `
    <li class="activity-item">
      <div class="activity-icon">
        <i data-lucide="${activity.icon}"></i>
      </div>
      <div class="activity-content">
        <div class="activity-message">${activity.message}</div>
        <div class="activity-timestamp">${formatTime(activity.timestamp)}</div>
      </div>
    </li>
  `
    )
    .join("");
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

    try {
      renderActivity(data);
    } catch (error) {
      console.error("Error rendering activity:", error);
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

window.openProveedorModal = openProveedorModal;
window.editProveedor = editProveedor;
window.deleteProveedor = deleteProveedor;
window.handleProveedorSubmit = handleProveedorSubmit;

function initDashboard() {
  highlightActive();
  initMobileMenu();
  loadDashboard();
  loadProveedores();
}

document.addEventListener("DOMContentLoaded", initDashboard);
