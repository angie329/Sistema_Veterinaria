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
  const form = document.getElementById("formMascota");

  if (!modal || !btnAgregar) return;

  btnAgregar.addEventListener("click", () => {
    modal.showModal();
    inicializarSelectoresDinamicos();
    inicializarBotonesAgregar();
  });

  btnCancelar?.addEventListener("click", () => modal.close());
  btnCerrar?.addEventListener("click", () => modal.close());

  // ✅ Envío del formulario
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombreMascota").value.trim();
    const fechaNacimiento = document.getElementById("fechaNacimiento").value;
    const razaId = document.getElementById("razaMascota").value;
    const tipoId = document.getElementById("tipoMascota").value;
    const generoId = document.getElementById("generoMascota").value;
    const observaciones = document.getElementById("observacionesMascota").value.trim();

    // ✅ Validación en frontend
    if (!nombre || !fechaNacimiento || !razaId || !tipoId || !generoId) {
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }

    const regexSQL = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|;|--|\*|\/\*)\b)/i;
    if (regexSQL.test(nombre) || regexSQL.test(observaciones)) {
      alert("Entrada inválida detectada. No uses palabras reservadas SQL.");
      return;
    }

    const payload = {
      nombre,
      fecha_nacimiento: fechaNacimiento,
      raza_id: parseInt(razaId),
      tipo_id: parseInt(tipoId),
      genero_id: parseInt(generoId),
      observaciones: observaciones || null,
    };

    try {
      const response = await fetch(`${config.BACKEND_URL}/v1/pets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!result.success) {
        alert(result.error || "Error al registrar la mascota.");
        return;
      }

      alert("🐾 Mascota registrada correctamente.");
      modal.close();
      form.reset();

      // Opcional: recargar la tabla de mascotas
      if (typeof cargarMascotas === "function") cargarMascotas();
    } catch (error) {
      console.error("Error al registrar mascota:", error);
      alert("Ocurrió un error al enviar los datos.");
    }
  });
}


async function cargarMascotas() {
  const tablaBody = document.querySelector(".pets-table tbody");
  const totalPets = document.querySelector(".metric-card .metric-info #totalPets");
  const lastPet = document.querySelector(".metric-card .metric-info #lastPet");
  const totalTreatmentPets = document.querySelector(".metric-card .metric-info #totalTreatmentPets");
  if (!tablaBody || !totalPets || !lastPet || !totalTreatmentPets) return;

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
        <td>${pet.genero}</td>
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

    lastPet.textContent = result.data[result.data.length - 1].nombre_mascota;
    totalPets.textContent = result.data.length;
    totalTreatmentPets.textContent = result.data.filter(pet => { return pet.mas_estado == "T" }).length;

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

/* ==========================================================
   🔧 CARGA DE SELECTORES Y OPCIONES DINÁMICAS
========================================================== */
async function fetchData(endpoint) {
  try {
    const res = await fetch(`${config.BACKEND_URL}/v1/pets/${endpoint}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const result = await res.json();
    return result.success ? result.data : [];
  } catch (err) {
    console.error(`Error al obtener ${endpoint}:`, err);
    return [];
  }
}

async function recargarSelector(select, selector, idRelacion = null, idSeleccionar = null) {
  const {endpoint, word} = selector
  const url = idRelacion ? `${endpoint}/${idRelacion}` : endpoint;
  const data = await fetchData(url);

  select.innerHTML = `<option value="" disabled selected>Seleccionar ${word}</option>`;
  data.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.nombre;
    option.dataset.id = item.id;
    select.appendChild(option);
  });

  if (idSeleccionar) select.value = idSeleccionar;
  return data;
}

/* ==========================================================
   🔧 INICIALIZACIÓN DE SELECTORES EN EL MODAL
========================================================== */
function inicializarSelectoresDinamicos() {
  const selectGenero = document.getElementById("generoMascota");
  const selectClasificacion = document.getElementById("clasificacionAnimal");
  const selectTipo = document.getElementById("tipoMascota");
  const selectRaza = document.getElementById("razaMascota");

  selectTipo.closest(".form-group").style.display = "none";
  selectRaza.closest(".form-group").style.display = "none";

  // Cargar género y clasificación
  recargarSelector(selectGenero, {endpoint: "genders", word:"género"});
  fetchData("types").then((data) => {
    selectClasificacion.innerHTML = `<option value="" disabled selected>Seleccionar clasificación</option>`;
    data.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.nombre;
      opt.dataset.id = c.id;
      selectClasificacion.appendChild(opt);
    });

    // Al cambiar clasificación → carga tipos
    selectClasificacion.addEventListener("change", async () => {
      const id = selectClasificacion.value;
      await recargarSelector(selectTipo, {endpoint: "types", word: "tipo"}, id);
      selectTipo.closest(".form-group").style.display = "block";
      selectRaza.closest(".form-group").style.display = "none";
    });

    // Al cambiar tipo → carga razas
    selectTipo.addEventListener("change", async () => {
      const id = selectTipo.value;
      await recargarSelector(selectRaza, {endpoint: "breeds", word: "raza"}, id);
      selectRaza.closest(".form-group").style.display = "block";
    });
  });
}

/* ==========================================================
   🔧 MODAL DE AGREGAR NUEVA OPCIÓN
========================================================== */
function inicializarBotonesAgregar() {
  const modal = document.getElementById("modalAgregarOpcion");
  const form = document.getElementById("formAgregarOpcion");
  const titulo = document.getElementById("tituloModalOpcion");
  const input = document.getElementById("nombreOpcion");
  const btnCerrar = modal.querySelector(".modal-close");
  const btnCancelar = modal.querySelector(".btn-cancelar");

  const selects = {
    clasificacion: document.getElementById("clasificacionAnimal"),
    tipo: document.getElementById("tipoMascota"),
    raza: document.getElementById("razaMascota"),
  };

  let tipoActual = null;

  document.querySelectorAll(".btn-add-option").forEach((btn) => {
    btn.addEventListener("click", () => {
      const label = btn.parentElement.previousElementSibling.textContent;
      tipoActual = label.includes("Clasificacion")
        ? "clasificacion"
        : label.includes("Tipo")
        ? "tipo"
        : "raza";

      titulo.textContent = `Agregar nueva ${tipoActual}`;
      input.value = "";
      modal.showModal();
    });
  });

  [btnCerrar, btnCancelar].forEach((b) => b.addEventListener("click", () => modal.close()));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = input.value.trim();
    if (!nombre) return;

    let body = { nombre };
    let endpoint = "";

    if (tipoActual === "clasificacion") {
      endpoint = "classifications";
    } else if (tipoActual === "tipo") {
      const clasificacionId = selects.clasificacion.value;
      if (!clasificacionId) return alert("Selecciona una clasificación primero.");
      endpoint = "types";
      body.clasificacion_id = clasificacionId;
    } else {
      const tipoId = selects.tipo.value;
      if (!tipoId) return alert("Selecciona un tipo primero.");
      endpoint = "breeds";
      body.tipo_id = tipoId;
    }

    const result = await agregarElemento(endpoint, body);
    if (result?.success) {
      alert(`🐾 ${tipoActual.charAt(0).toUpperCase() + tipoActual.slice(1)} agregada correctamente.`);
      if (tipoActual === "clasificacion")
        await recargarSelector(selects.clasificacion, {endpoint: "types", word: "tipo"}, null, result.id);
      if (tipoActual === "tipo")
        await recargarSelector(selects.tipo, {endpoint: "types", word: "tipo"}, body.clasificacion_id, result.id);
      if (tipoActual === "raza")
        await recargarSelector(selects.raza, {endpoint: "breeds", word: "raza"}, body.tipo_id, result.id);
      modal.close();
    } else {
      alert("Error al agregar.");
    }
  });
}

/* ==========================================================
   🔧 FUNCIÓN ÚNICA PARA POSTEAR CLASIFICACIÓN / TIPO / RAZA
========================================================== */
async function agregarElemento(endpoint, data) {
  try {
    const res = await fetch(`${config.BACKEND_URL}/v1/pets/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    console.error(`Error al agregar en ${endpoint}:`, err);
    return { success: false };
  }
}



function initDashboard() {
  highlightActive();
  initMobileMenu();
  initModalMascota();
  cargarMascotas();
}

document.addEventListener("DOMContentLoaded", initDashboard);

