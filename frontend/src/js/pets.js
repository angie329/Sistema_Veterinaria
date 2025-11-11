import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { createIcons, icons } from "lucide";

import { config } from "@/config/env.js";

const iconConfig = {
  icons: {
    LayoutDashboard: icons.LayoutDashboard,
    Users: icons.Users,
    MapPin: icons.MapPin,
    Dog: icons.Dog,
    Stethoscope: icons.Stethoscope,
    User: icons.User,
    Settings: icons.Settings,
    Search: icons.Search,
    Bell: icons.Bell,
    ChevronDown: icons.ChevronDown,
    Menu: icons.Menu,
    PlusCircle: icons.PlusCircle,
    Heart: icons.Heart,
    Activity: icons.Activity,
    PawPrint: icons.PawPrint,
    FileText: icons.FileText,
    Edit: icons.Edit,
    Trash2: icons.Trash2,
    AlertTriangle: icons.AlertTriangle,
  },
};

// Resalta el elemento activo en el sidebar
function highlightActive() {
  const currentPath = window.location.pathname;
  const navItems = document.querySelectorAll(".sidebar-nav-item");
  navItems.forEach((a) => {
    const href = a.getAttribute("href");
    const isActive =
      href === currentPath ||
      (currentPath === "/pets.html" && href === "/pets");
    a.classList.toggle("sidebar-nav-item-active", isActive);
  });
}

// Inicializa el menú móvil del sidebar
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const sidebar = document.getElementById("sidebar");
  const overlay =
    document.getElementById("sidebarOverlay") ||
    document.querySelector(".sidebar-overlay");

  // Alternar visibilidad del sidebar
  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener("click", () => {
      sidebar.classList.toggle("sidebar-open");
      if (overlay) {
        overlay.classList.toggle("overlay-visible");
      }
    });
  }

  // Cerrar menú al hacer clic en el fondo oscuro
  if (overlay) {
    overlay.addEventListener("click", () => {
      sidebar.classList.remove("sidebar-open");
      overlay.classList.remove("overlay-visible");
    });
  }

  // Al cambiar el tamaño de la ventana, cerrar el menú si supera el ancho móvil
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      sidebar.classList.remove("sidebar-open");
      if (overlay) overlay.classList.remove("overlay-visible");
    }
  });
}

// Inicializa el modal de registro de mascotas
function initModalMascota() {
  const modal = document.getElementById("modalRegistrarMascota");
  const btnAgregar = document.getElementById("btnAgregarMascota");
  const btnCancelar = modal?.querySelector(".btn-cancelar");
  const btnCerrar = modal?.querySelector(".modal-close");
  const form = document.getElementById("formMascota");

  if (!modal || !btnAgregar) return;

  // Abrir modal al presionar "Agregar"
  btnAgregar.addEventListener("click", () => {
    modal.showModal();
    inicializarSelectoresDinamicos();
    inicializarBotonesAgregar();
  });

  // Cerrar modal
  btnCancelar?.addEventListener("click", () => modal.close());
  btnCerrar?.addEventListener("click", () => modal.close());

  // Envío del formulario
  form.addEventListener("submit", manejarEnvioFormularioMascota);
}

// Carga la lista de mascotas desde la API
async function cargarMascotas() {
  const tablaBody = document.querySelector(".pets-table tbody");
  const totalPets = document.querySelector(
    ".metric-card .metric-info #totalPets"
  );
  const lastPet = document.querySelector(".metric-card .metric-info #lastPet");
  const totalTreatmentPets = document.querySelector(
    ".metric-card .metric-info #totalTreatmentPets"
  );
  if (!tablaBody || !totalPets || !lastPet || !totalTreatmentPets) return;

  try {
    const response = await fetch(`${config.BACKEND_URL}/v1/pets`);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    const result = await response.json();

    // Si no hay datos, mostrar mensaje vacío
    if (!result.success || result.count === 0) {
      tablaBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding:1rem;">
            No hay mascotas registradas.
          </td>
        </tr>`;
      return;
    }

    const estados = {
      A: "Activo",
      I: "Inactivo",
      T: "Tratamiento",
    };

    // Construir filas dinámicamente
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
          <td>${estados[pet.mas_estado]}</td>
          <td class="table-actions">
            <button class="btn-edit" data-id="${pet.id_mascota}" title="Editar">
              <i data-lucide="edit"></i>
            </button>
            <button class="btn-delete" data-id="${
              pet.id_mascota
            }" title="Eliminar">
              <i data-lucide="trash-2"></i>
            </button>
          </td>
        </tr>`
      )
      .join("");

    // Actualizar métricas
    lastPet.textContent = result.data[result.data.length - 1].nombre_mascota;
    totalPets.textContent = result.data.length;
    totalTreatmentPets.textContent = result.data.filter(
      (p) => p.mas_estado === "T"
    ).length;

    agregarEventosBotones();
    agregarEventosFilas();
  } catch (error) {
    console.error("Error cargando mascotas:", error);
    tablaBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:1rem; color:red;">
          Error al cargar las mascotas: ${error.message}
        </td>
      </tr>`;
  }
}

// Asigna evento de clic a cada fila para mostrar observaciones
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

// Muestra detalles u observaciones de una mascota
async function mostrarObservaciones(idMascota) {
  const observacionesPanel = document.getElementById("observations-text");
  if (!observacionesPanel) return;

  observacionesPanel.textContent = "Cargando observaciones...";
  try {
    const response = await fetch(
      `${config.BACKEND_URL}/v1/pets/${idMascota}/details`
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const result = await response.json();
    if (!result.success || !result.data) {
      observacionesPanel.textContent = "No se encontraron observaciones.";
      return;
    }

    const { nombre_mascota, observaciones } = result.data;
    observacionesPanel.innerHTML = `
      <strong>${nombre_mascota}</strong><br>
      ${observaciones || "Sin observaciones registradas."}`;
    observacionesPanel.scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (error) {
    console.error("Error obteniendo observaciones:", error);
    observacionesPanel.textContent = "Error al cargar observaciones.";
  }
}

// Agrega los eventos de edición y eliminación a los botones
function agregarEventosBotones() {
  document
    .querySelectorAll(".btn-edit")
    .forEach((btn) => btn.addEventListener("click", manejarEditarMascota));
  document
    .querySelectorAll(".btn-delete")
    .forEach((btn) => btn.addEventListener("click", manejarEliminarMascota));
}

// Calcula la edad en años a partir de la fecha de nacimiento
function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return "-";
  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad + " año" + (edad !== 1 ? "s" : "");
}

// Realiza una petición genérica para obtener datos de un endpoint
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

// Recarga dinámicamente un selector según su dependencia
async function recargarSelector(
  select,
  selector,
  idRelacion = null,
  idSeleccionar = null
) {
  const { endpoint, word } = selector;
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

// Variable global que indica si se está editando una mascota existente
let modoEdicionMascota = null;

// Maneja el registro o actualización de una mascota
async function manejarEnvioFormularioMascota(e) {
  e.preventDefault();

  const modal = document.getElementById("modalRegistrarMascota");
  const form = document.getElementById("formMascota");

  const nombre = document.getElementById("nombreMascota").value.trim();
  const fechaNacimiento = document.getElementById("fechaNacimiento").value;
  const razaId = document.getElementById("razaMascota").value;
  const tipoId = document.getElementById("tipoMascota").value;
  const generoId = document.getElementById("generoMascota").value;
  const observaciones = document
    .getElementById("observacionesMascota")
    .value.trim();
  const estado = document.getElementById("estadoMascota")?.value || "A";

  if (!nombre || !fechaNacimiento || !razaId || !tipoId || !generoId) {
    alert("Por favor, completa todos los campos requeridos.");
    return;
  }

  const regexSQL =
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|;|--|\*|\/\*)\b)/i;
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
    mas_estado: estado,
  };

  const isEdit = modoEdicionMascota !== null;

  try {
    const endpoint = isEdit
      ? `${config.BACKEND_URL}/v1/pet/${modoEdicionMascota}`
      : `${config.BACKEND_URL}/v1/pets`;

    const method = isEdit ? "PUT" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!result.success) {
      alert(
        result.error ||
          `Error al ${isEdit ? "actualizar" : "registrar"} la mascota.`
      );
      return;
    }

    alert(`Mascota ${isEdit ? "actualizada" : "registrada"} correctamente.`);
    modal.close();
    form.reset();
    modoEdicionMascota = null;

    const btnGuardar = form.querySelector(".btn-guardar");
    if (btnGuardar) btnGuardar.textContent = "Guardar";

    // Oculta nuevamente el selector de estado después de guardar
    const grupoEstado = document.getElementById("grupoEstadoMascota");
    if (grupoEstado) grupoEstado.style.display = "none";

    if (typeof cargarMascotas === "function") cargarMascotas();
  } catch (error) {
    console.error("Error al guardar mascota:", error);
    alert("Ocurrió un error al enviar los datos.");
  }
}

// Obtiene los datos de una mascota y los muestra en el formulario para editar
async function manejarEditarMascota(event) {
  const idMascota = event.currentTarget.dataset.id;
  if (!idMascota) return;

  modoEdicionMascota = idMascota; // activa el modo edición
  const modal = document.getElementById("modalRegistrarMascota");
  const form = document.getElementById("formMascota");

  try {
    const response = await fetch(`${config.BACKEND_URL}/v1/pet/${idMascota}`);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

    const result = await response.json();
    if (!result.success || !result.data) {
      alert("No se encontró la información de la mascota.");
      return;
    }

    const mascota = result.data;

    // Carga los selectores dinámicos antes de asignar valores
    inicializarSelectoresDinamicos();

    // Rellena los campos del formulario con los datos obtenidos
    document.getElementById("nombreMascota").value =
      mascota.nombre_mascota || "";
    document.getElementById("fechaNacimiento").value =
      mascota.mas_fecha_nacimiento
        ? mascota.mas_fecha_nacimiento.split("T")[0]
        : "";
    document.getElementById("observacionesMascota").value =
      mascota.mas_observaciones || "";

    // Muestra y asigna valor al selector de estado
    const grupoEstado = document.getElementById("grupoEstadoMascota");
    grupoEstado.style.display = "block";
    const selectEstado = document.getElementById("estadoMascota");
    selectEstado.value = mascota.mas_estado || "A";

    // Asigna los valores a los selectores dependientes
    await recargarSelector(
      document.getElementById("generoMascota"),
      { endpoint: "genders", word: "género" },
      null,
      mascota.genero_id
    );

    await recargarSelector(
      document.getElementById("clasificacionAnimal"),
      { endpoint: "types", word: "clasificación" },
      null,
      mascota.clasificacion_id
    );

    await recargarSelector(
      document.getElementById("tipoMascota"),
      { endpoint: "types", word: "tipo" },
      mascota.clasificacion_id,
      mascota.tipo_id
    );
    document
      .getElementById("tipoMascota")
      .closest(".form-group").style.display = "block";

    await recargarSelector(
      document.getElementById("razaMascota"),
      { endpoint: "breeds", word: "raza" },
      mascota.tipo_id,
      mascota.raza_id
    );
    document
      .getElementById("razaMascota")
      .closest(".form-group").style.display = "block";

    // Cambia el texto del botón principal
    const btnGuardar = form.querySelector(".btn-guardar");
    if (btnGuardar) btnGuardar.textContent = "Actualizar";

    modal.showModal();
  } catch (error) {
    console.error("Error al cargar datos de la mascota:", error);
    alert("Error al cargar los datos de la mascota.");
  }
}

// Muestra confirmación y elimina la mascota seleccionada
function manejarEliminarMascota(event) {
  event.stopPropagation(); // evita que se dispare el click en la fila
  const idMascota = event.currentTarget.dataset.id;
  if (!idMascota) return;

  const modal = document.getElementById("modalEliminarMascota");
  const btnConfirmar = document.getElementById("btnConfirmarEliminar");

  modal.showModal();

  // Elimina cualquier listener previo para evitar duplicados
  btnConfirmar.replaceWith(btnConfirmar.cloneNode(true));
  const nuevoBtnConfirmar = document.getElementById("btnConfirmarEliminar");

  nuevoBtnConfirmar.addEventListener("click", async () => {
    try {
      const response = await fetch(
        `${config.BACKEND_URL}/v1/pet/${idMascota}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!result.success) {
        alert(result.error || "Error al eliminar la mascota.");
        return;
      }

      alert("Mascota eliminada correctamente.");
      modal.close();

      // Recarga la tabla de mascotas
      if (typeof cargarMascotas === "function") cargarMascotas();
    } catch (error) {
      console.error("Error al eliminar mascota:", error);
      alert("Ocurrió un error al eliminar la mascota.");
    }
  });
}

// Configura y carga los selectores dinámicos del formulario
function inicializarSelectoresDinamicos() {
  const selectGenero = document.getElementById("generoMascota");
  const selectClasificacion = document.getElementById("clasificacionAnimal");
  const selectTipo = document.getElementById("tipoMascota");
  const selectRaza = document.getElementById("razaMascota");

  selectTipo.closest(".form-group").style.display = "none";
  selectRaza.closest(".form-group").style.display = "none";

  // Carga los selectores iniciales de género y clasificación
  recargarSelector(selectGenero, { endpoint: "genders", word: "género" });
  fetchData("types").then((data) => {
    selectClasificacion.innerHTML = `<option value="" disabled selected>Seleccionar clasificación</option>`;
    data.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.nombre;
      opt.dataset.id = c.id;
      selectClasificacion.appendChild(opt);
    });

    // Al cambiar la clasificación, se cargan los tipos correspondientes
    selectClasificacion.addEventListener("change", async () => {
      const id = selectClasificacion.value;
      await recargarSelector(
        selectTipo,
        { endpoint: "types", word: "tipo" },
        id
      );
      selectTipo.closest(".form-group").style.display = "block";
      selectRaza.closest(".form-group").style.display = "none";
    });

    // Al cambiar el tipo, se cargan las razas correspondientes
    selectTipo.addEventListener("change", async () => {
      const id = selectTipo.value;
      await recargarSelector(
        selectRaza,
        { endpoint: "breeds", word: "raza" },
        id
      );
      selectRaza.closest(".form-group").style.display = "block";
    });
  });
}

// Inicializa el modal para agregar nuevas opciones (clasificaciones, tipos, razas)
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

  [btnCerrar, btnCancelar].forEach((b) =>
    b.addEventListener("click", () => modal.close())
  );

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
      if (!clasificacionId)
        return alert("Selecciona una clasificación primero.");
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
      alert(
        `${
          tipoActual.charAt(0).toUpperCase() + tipoActual.slice(1)
        } agregada correctamente.`
      );
      if (tipoActual === "clasificacion")
        await recargarSelector(
          selects.clasificacion,
          { endpoint: "types", word: "tipo" },
          null,
          result.id
        );
      if (tipoActual === "tipo")
        await recargarSelector(
          selects.tipo,
          { endpoint: "types", word: "tipo" },
          body.clasificacion_id,
          result.id
        );
      if (tipoActual === "raza")
        await recargarSelector(
          selects.raza,
          { endpoint: "breeds", word: "raza" },
          body.tipo_id,
          result.id
        );
      modal.close();
    } else {
      alert("Error al agregar el elemento.");
    }
  });
}

// Registra nuevas clasificaciones, tipos o razas en el backend
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

// Crea dinámicamente el modal de confirmación de eliminación
function crearModalEliminar() {
  if (document.getElementById("modalEliminarMascota")) return; // evita duplicados

  const modalHTML = `
    <dialog id="modalEliminarMascota" class="modal">
      <div class="modal-header">
        <h2>Confirmar eliminación</h2>
      </div>
      <div class="modal-description">
        <p>
          ¿Estás seguro de que deseas eliminar esta mascota?<br>
          Esta acción no se puede deshacer.
        </p>
      </div>
      <div class="modal-actions">
        <button id="btnConfirmarEliminar" class="btn-eliminar">Eliminar</button>
        <button id="btnCancelarEliminar" class="btn-cancelar">Cancelar</button>
      </div>
    </dialog>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);

  const modal = document.getElementById("modalEliminarMascota");
  const btnCancelar = document.getElementById("btnCancelarEliminar");

  btnCancelar.addEventListener("click", () => modal.close());
}

// Genera un reporte PDF con la información de las mascotas
async function generarReportePDF() {
  try {
    const response = await fetch(`${config.BACKEND_URL}/v1/pets`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();

    // Verifica si existen datos para generar el reporte
    if (!result.success || !result.data.length) {
      alert("No hay mascotas para generar el reporte.");
      return;
    }

    const doc = new jsPDF();
    const fechaActual = new Date().toLocaleString();

    // Encabezado del reporte
    doc.setFontSize(16);
    doc.text("Reporte de Mascotas", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generado: ${fechaActual}`, 14, 26);

    const columnas = [
      "ID",
      "Nombre",
      "Tipo",
      "Raza",
      "Género",
      "Estado",
      "Nacimiento",
      "Observaciones",
    ];

    // Construcción de filas a partir de los datos obtenidos
    const filas = result.data.map((m) => [
      m.id_mascota,
      m.nombre_mascota,
      m.tipo_mascota,
      m.raza || "-",
      m.genero,
      m.mas_estado === "A"
        ? "Activo"
        : m.mas_estado === "I"
        ? "Inactivo"
        : "Tratamiento",
      new Date(m.mas_fecha_nacimiento).toLocaleDateString(),
      m.mas_observaciones || "—",
    ]);

    // Generación de la tabla con los datos de mascotas
    autoTable(doc, {
      startY: 35,
      head: [columnas],
      body: filas,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: {
        fillColor: [23, 107, 135],
        textColor: 255,
        halign: "center",
      },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });

    // Pie de página con el total de registros
    const totalMascotas = result.data.length;
    doc.text(
      `Total de mascotas: ${totalMascotas}`,
      14,
      doc.lastAutoTable.finalY + 10
    );

    // Descarga del archivo PDF
    doc.save("reporte_mascotas.pdf");
  } catch (err) {
    console.error("Error generando PDF:", err);
    alert("Ocurrió un error al generar el reporte PDF.");
  }
}

// Inicializa el botón para generar el reporte en PDF
function initBtnReporte() {
  const btnPDF = document.getElementById("btnGenerarPDF");
  if (btnPDF) btnPDF.addEventListener("click", generarReportePDF);
}

// Inicializa todos los componentes de la página de mascotas
async function initPets() {
  highlightActive();
  initMobileMenu();
  initModalMascota();
  crearModalEliminar();
  await cargarMascotas();
  initBtnReporte();
  createIcons(iconConfig);
}

document.addEventListener("DOMContentLoaded", initPets);
