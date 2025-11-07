import { createIcons, icons } from "lucide";
const API_URL = `${import.meta.env.VITE_BACKEND_URL}/v1/veterinarios`;

function highlightActive() {
  const currentPath = window.location.pathname;
  document.querySelectorAll(".sidebar-nav-item").forEach((a) => {
    const href = a.getAttribute("href");
    a.classList.toggle(
      "sidebar-nav-item-active",
      href === currentPath ||
        (currentPath === "veterinarios.html" && href === "/veterinarios")
    );
  });
}

createIcons({
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
  },
});


function highlightActive() {
  const currentPath = window.location.pathname;
  document.querySelectorAll(".sidebar-nav-item").forEach((a) => {
    const href = a.getAttribute("href");
    a.classList.toggle(
      "sidebar-nav-item-active",
      href === currentPath ||
        (currentPath === "veterinarios/veterinarios.html" && href === "/veterinarios")
    );
  });
}

createIcons({
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
  },
});


async function fetchVeterinarios() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Error al obtener los veterinarios");
    const data = await res.json();
    console.log("✅ Datos recibidos:", data); // 👈 agrega esta línea para revisar
    renderVeterinarios(data);
  } catch (error) {
    console.error(" Error:", error);
  }
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

function initDashboard() {
  highlightActive();
  initMobileMenu();
}

document.addEventListener("DOMContentLoaded", initDashboard);

const veterinarios = [
  {
 
    nombre: "Dra. Ana Torres",
    especialidad: "Felinos",
    telefono: "09999999",
    correo: "ana@vet.com",
    turno: "Mañana",
  },
  {
   
    nombre: "Dr. Carlos López",
    especialidad: "Caninos",
    telefono: "09876543",
    correo: "carlos@vet.com",
    turno: "Tarde",
  },
];

const tbody = document.getElementById("tbodyVeterinarios");

function renderTabla() {
  tbody.innerHTML = veterinarios.map(vet => `
    <tr>
  
      <td>${vet.nombre}</td>
      <td>${vet.especialidad}</td>
      <td>${vet.telefono}</td>
      <td>${vet.correo}</td>
      <td>${vet.turno}</td>
      <td>
        <button class="btn-editar">✏️</button>
        <button class="btn-eliminar">🗑️</button>
      </td>
    </tr>
  `).join("");
}

renderTabla();

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
