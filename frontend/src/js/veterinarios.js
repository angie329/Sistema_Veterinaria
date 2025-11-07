import { createIcons, icons } from "lucide";
const API_URL = `${import.meta.env.VITE_BACKEND_URL}/v1/veterinarios`;
const TURNOS_URL = `${import.meta.env.VITE_BACKEND_URL}/v1/turnos`;


function highlightActive() {
  const currentPath = window.location.pathname;
  document.querySelectorAll(".sidebar-nav-item").forEach((a) => {
    const href = a.getAttribute("href");
    a.classList.toggle(
      "sidebar-nav-item-active",
      href === currentPath ||
        (currentPath === "/veterinarios.html" && href === "/veterinarios")
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




/* DATOS DEL BACKEND */
async function fetchVeterinarios() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Error al obtener los veterinarios");
    const data = await res.json();
    
    console.log("🩺 Veterinarios recibidos:", data);
    renderVeterinarios(data);
  } catch (error) {
    console.error(" Error:", error);
  }
}


function renderVeterinarios(veterinarios) {
  const tableBody = document.getElementById("veterinariansTable");
  tableBody.innerHTML = "";

  if (!veterinarios.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; color:#888;">
          No hay veterinarios registrados
        </td>
      </tr>`;
    return;
  }

  veterinarios.forEach((vet) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${vet.Vet_Nombres} ${vet.Vet_Apellidos}</td>
      <td>${vet.Especialidad || "Sin especialidad"}</td>
      <td>${vet.Vet_Telefono || "—"}</td>
      <td>${vet.Vet_Correo || "—"}</td>
      <td>
        <button class="btn-turnos" onclick="verTurnos(${vet.id_Veterinario}, '${vet.Vet_Nombres}')">
          Ver turnos
        </button>
      </td>
      <td>
        <div class="actions">
          <button class="action-btn edit" onclick="editVeterinarian(${vet.id_Veterinario})">
            <i data-lucide="pencil"></i>
          </button>
          <button class="action-btn delete" onclick="deleteVeterinarian(${vet.id_Veterinario})">
            <i data-lucide="trash"></i>
          </button>
        </div>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

// Inicializar al cargar la página
document.addEventListener("DOMContentLoaded", fetchVeterinarios);

async function verTurnos(idVeterinario, nombreVet) {
  try {
    const res = await fetch(`${TURNOS_URL}/${idVeterinario}`);
    const turnos = await res.json();
   
    const listaTurnos = turnos.map(t => `
      <tr>
        <td>${t.Tur_Dia || "—"}</td>
        <td>${t.Tur_HoraInicio || "—"}</td>
        <td>${t.Tur_HoraFin || "—"}</td>
        <td>${t.Tur_Tipo || "—"}</td>
      </tr>
    `).join("");

    document.getElementById("modalTitle").innerText = `Turnos de ${nombreVet}`;
    document.getElementById("modalBody").innerHTML = `
      <table class="tabla-turnos">
        <thead>
          <tr>
            <th>Día</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Tipo</th>
          </tr>
        </thead>
        <tbody>
          ${listaTurnos || "<tr><td colspan='6'>Sin turnos registrados</td></tr>"}
        </tbody>
      </table>
    `;

    document.getElementById("modalTurnos").style.display = "block";

  } catch (error) {
    console.error("Error al cargar turnos:", error);
  }
}

function cerrarModal() {
  document.getElementById("modalTurnos").style.display = "none";
}

// 🔹 Exportar al window (para onclick en HTML)
window.verTurnos = verTurnos;
window.cerrarModal = cerrarModal;