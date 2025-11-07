import { Activity, AlertTriangle, createIcons, Heart, icons, PawPrint } from "lucide";
import { config } from "@/config/env.js"; // si ya usas alias @, o ajusta la ruta


function highlightActive() {
  const currentPath = window.location.pathname;
  document.querySelectorAll(".sidebar-nav-item").forEach((a) => {
    const href = a.getAttribute("href");
    a.classList.toggle(
      "sidebar-nav-item-active",
      href === currentPath ||
      (currentPath === "/pets.html" && href === "/pets")
    );
  });
}

const iconos = {
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
    Edit: icons.Edit,
    Trash2: icons.Trash2,
    PawPrint: icons.PawPrint,
    Activity: icons.Activity,
    Heart: icons.Heart,
    AlertTriangle: icons.AlertTriangle,
  },
}
createIcons(iconos);

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

function initModalMascota() {
  const modal = document.getElementById("modalRegistrarMascota");
  const btnAgregar = document.getElementById("btnAgregarMascota");
  const btnCancelar = modal?.querySelector(".btn-cancelar");
  const btnCerrar = modal?.querySelector(".modal-close");

  if (!modal || !btnAgregar) return;

  // Abrir modal
  btnAgregar.addEventListener("click", () => {
    modal.showModal();
  });

  // Cerrar modal (botón cancelar)
  btnCancelar?.addEventListener("click", () => {
    modal.close();
  });

  // Cerrar modal (botón ×)
  btnCerrar?.addEventListener("click", () => {
    modal.close();
  });
}

async function cargarMascotas() {
  const tablaBody = document.querySelector(".pets-table tbody");
  if (!tablaBody) return;

  try {
    const response = await fetch(`${config.BACKEND_URL}/v1/pets`);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    const result = await response.json();

    if (!result.success || result.count === 0) {
      tablaBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding:1rem;">
            No hay mascotas registradas.
          </td>
        </tr>
      `;
      return;
    }

    // Construir las filas con los botones y el data-id
    tablaBody.innerHTML = result.data
      .map(
        (pet) => `
      <tr data-id="${pet.id_mascota}">
        <td>${pet.id_mascota}</td>
        <td>${pet.nombre_mascota}</td>
        <td>${pet.tipo_mascota}</td>
        <td>${pet.raza || "-"}</td>
        <td>${calcularEdad(pet.mas_fecha_nacimiento)}</td>
        <td>${pet.mas_estado === "A" ? "Activo" : "Inactivo"}</td>
        <td class="table-actions">
          <button class="btn-edit" data-id="${pet.id_mascota}" title="Editar">
            <i data-lucide="edit"></i>
          </button>
          <button class="btn-delete" data-id="${pet.id_mascota}" title="Eliminar">
            <i data-lucide="trash-2"></i>
          </button>
        </td>
      </tr>`
      )
      .join("");


    // Regenerar los íconos
    createIcons(iconos);

    // Agregar eventos a los botones
    agregarEventosBotones();
    agregarEventosFilas();

  } catch (error) {
    console.error("Error cargando mascotas:", error);
    tablaBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:1rem; color:red;">
          Error al cargar las mascotas: ${error.message}
        </td>
      </tr>
    `;
  }
}

function agregarEventosFilas() {
  const filas = document.querySelectorAll(".pets-table tbody tr");

  filas.forEach((fila) => {
    fila.addEventListener("click", async () => {
      const idMascota = fila.dataset.id;
      if (!idMascota) return;
      await mostrarObservaciones(idMascota);
    });
  });
}

async function mostrarObservaciones(idMascota) {
  const observacionesPanel = document.getElementById("observations-text");
  if (!observacionesPanel) return;

  observacionesPanel.textContent = "Cargando observaciones...";

  try {
    const response = await fetch(`${config.BACKEND_URL}/v1/pets/${idMascota}/details`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const result = await response.json();

    if (!result.success || !result.data) {
      observacionesPanel.textContent = "No se encontraron observaciones para esta mascota.";
      return;
    }

    const { nombre_mascota, observaciones } = result.data;

    observacionesPanel.innerHTML = `
      <strong>${nombre_mascota}</strong><br>
      ${observaciones || "Sin observaciones registradas."}
    `;
  } catch (error) {
    console.error("Error obteniendo observaciones:", error);
    observacionesPanel.textContent = "Error al cargar observaciones.";
  }
}


function agregarEventosBotones() {
  // Botones de editar
  const btnsEditar = document.querySelectorAll(".btn-edit");
  btnsEditar.forEach((btn) => {
    btn.addEventListener("click", manejarEditarMascota);
  });

  // Botones de eliminar
  const btnsEliminar = document.querySelectorAll(".btn-delete");
  btnsEliminar.forEach((btn) => {
    btn.addEventListener("click", manejarEliminarMascota);
  });
}

function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return "-";
  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad + " año" + (edad !== 1 ? "s" : "");
}

function manejarEditarMascota(event) {
  const idMascota = event.currentTarget.dataset.id;
  console.log("Editar mascota con ID:", idMascota);
  // TODO: implementar lógica de edición
}

function manejarEliminarMascota(event) {
  const idMascota = event.currentTarget.dataset.id;
  console.log("Eliminar mascota con ID:", idMascota);
  // TODO: implementar lógica de eliminación
}



function initDashboard() {
  highlightActive();
  initMobileMenu();
  initModalMascota();
  cargarMascotas();
}

document.addEventListener("DOMContentLoaded", initDashboard);
