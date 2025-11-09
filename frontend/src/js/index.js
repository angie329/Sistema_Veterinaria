import { createIcons, icons } from "lucide";

import { config } from "../config/env.js";

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

function initDashboard() {
  highlightActive();
  initMobileMenu();
  loadDashboard();
}

document.addEventListener("DOMContentLoaded", initDashboard);