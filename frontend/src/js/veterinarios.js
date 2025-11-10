import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { createIcons, icons } from "lucide";

import { config } from "@/config/env.js";

const REPORT_URL = `${config.BACKEND_URL}/v1/reportes/veterinarios`;
const API_URL = `${config.BACKEND_URL}/v1/veterinarios`;
const TURNOS_URL = `${config.BACKEND_URL}/v1/turnos`;

/* ========== NAVEGACIÓN Y MENÚ ========== */
function highlightActive() {
  const currentPath = window.location.pathname;
  document.querySelectorAll(".sidebar-nav-item").forEach((a) => {
    const href = a.getAttribute("href");
    a.classList.toggle(
      "sidebar-nav-item-active",
      href === currentPath ||
        (currentPath.includes("veterinarios") && href.includes("veterinarios"))
    );
  });
}

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
    Edit: icons.Edit,
    Trash2: icons.Trash2,
    X: icons.X,
    FileText: icons.FileText,
    FileSpreadsheet: icons.FileSpreadsheet,
    FileCode: icons.FileCode,
    Braces: icons.Braces,
    File: icons.File,
    Save: icons.Save,
    MapPin: icons.MapPin,
    User: icons.User,
  },
};

function initMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const sidebar = document.getElementById("sidebar");
  const overlay =
    document.getElementById("sidebarOverlay") ||
    document.querySelector(".sidebar-overlay");

  if (!mobileMenuBtn || !sidebar) return;

  mobileMenuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("sidebar-open");
    if (overlay) {
      overlay.classList.toggle("overlay-visible");
    }
  });

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

/* ========== CRUD: LEER ========== */
async function fetchVeterinarios() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Error al obtener los veterinarios");
    const data = await res.json();
    renderVeterinarios(data);
  } catch (error) {
    console.error("Error cargando veterinarios:", error);
  }
}

function renderVeterinarios(veterinarios = []) {
  const tableBody = document.getElementById("veterinariansTable");
  tableBody.innerHTML = veterinarios.length
    ? veterinarios
        .map(
          (vet) => `
        <tr>
          <td>${vet.Vet_Nombres} ${vet.Vet_Apellidos}</td>
          <td>${vet.Especialidad || "Sin especialidad"}</td>
          <td>${vet.Vet_Telefono || "—"}</td>
          <td>${vet.Vet_Correo || "—"}</td>
          <td>
            <button class="btn-turnos" data-id="${
              vet.id_Veterinario
            }" data-nombre="${vet.Vet_Nombres}">
              Ver turnos
            </button>
          </td>
          <td>
            <div class="actions">
              <button class="action-btn edit" data-vet='${JSON.stringify(
                vet
              )}' title="Editar"><i data-lucide="edit"></i></button>
              <button class="action-btn delete" data-id="${
                vet.id_Veterinario
              }" title="Eliminar"><i data-lucide="trash2"></i></button>
            </div>
          </td>
        </tr>`
        )
        .join("")
    : `<tr><td colspan="6" style="text-align:center; color:#888;">No hay veterinarios registrados</td></tr>`;
    createIcons(iconConfig);
}


/* ========== FUNCIONES AUXILIARES ========== */
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal && modal instanceof HTMLDialogElement) {
    modal.showModal();
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal && modal instanceof HTMLDialogElement) {
    modal.close();
  }
}

/* ========== ESPECIALIDADES ========== */
function cargarEspecialidades(selectId, selectedNombre = null) {
  const select = document.getElementById(selectId);
  const opciones = ["Animal", "Enfermedad"];
  select.innerHTML = opciones
    .map(
      (nombre) => `
        <option value="${nombre}" ${
        nombre === selectedNombre ? "selected" : ""
      }>${nombre}</option>
      `
    )
    .join("");
}

/* ========== TURNOS ========== */
async function verTurnos(idVeterinario, nombreVet) {
  try {
    const res = await fetch(`${TURNOS_URL}/${idVeterinario}`);
    if (!res.ok) throw new Error("Error al obtener turnos");
    const turnos = await res.json();

    const listaTurnos = turnos.length
      ? turnos
          .map(
            (t) => `
          <tr>
            <td>${t.Tur_Dia || "—"}</td>
            <td>${t.Tur_HoraInicio || "—"}</td>
            <td>${t.Tur_HoraFin || "—"}</td>
            <td>${t.Tur_Tipo || "—"}</td>
          </tr>`
          )
          .join("")
      : "<tr><td colspan='4'>Sin turnos registrados</td></tr>";

    const modalTitle = document.getElementById("modalTitle");
    const modalBody = document.getElementById("modalBody");
    const modal = document.getElementById("modalTurnos");

    if (modalTitle) {
      modalTitle.textContent = `Turnos de ${nombreVet}`;
    }

    if (modalBody) {
      modalBody.innerHTML = `
      <table class="tabla-turnos">
        <thead>
          <tr><th>Día</th><th>Inicio</th><th>Fin</th><th>Tipo</th></tr>
        </thead>
        <tbody>${listaTurnos}</tbody>
      </table>
    `;
    }

    if (modal && modal instanceof HTMLDialogElement) {
      modal.showModal();
    }
  } catch (error) {
    console.error("Error al cargar turnos:", error);
  }
}

function cerrarModalTurnos() {
  const modal = document.getElementById("modalTurnos");
  if (modal && modal instanceof HTMLDialogElement) {
    modal.close();
  }
}

/* ========== EDITAR VETERINARIO ========== */
async function abrirModalEditar(vet) {
  document.getElementById("editIdVet").value = vet.id_Veterinario;
  document.getElementById("editNombre").value = vet.Vet_Nombres;
  document.getElementById("editApellido").value = vet.Vet_Apellidos;
  document.getElementById("editTelefono").value = vet.Vet_Telefono || "";
  document.getElementById("editCorreo").value = vet.Vet_Correo || "";
  cargarEspecialidades("editEspecialidad", vet.Especialidad);
  openModal("modalEditar");
}

/* ========== AGREGAR VETERINARIO ========== */

/* ========== GUARDAR (POST / PUT) ========== */
async function saveVeterinario(method, endpoint, data) {
  const res = await fetch(endpoint, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Error en ${method}`);
  await fetchVeterinarios();
}

/* ========== EVENTOS CRUD ========== */
document.addEventListener("click", async (e) => {
  const editBtn = e.target.closest(".action-btn.edit");
  const deleteBtn = e.target.closest(".action-btn.delete");
  const turnosBtn = e.target.closest(".btn-turnos");

  if (editBtn) {
    const vet = JSON.parse(editBtn.dataset.vet);
    abrirModalEditar(vet);
  }

  if (deleteBtn) {
    const id = deleteBtn.dataset.id;
    if (confirm("¿Seguro que deseas eliminar este veterinario?")) {
      try {
        await saveVeterinario("DELETE", `${API_URL}/${id}`);
        alert("Veterinario desactivado correctamente");
      } catch (err) {
        console.error(err);
        alert("Error al eliminar el veterinario");
      }
    }
  }

  if (turnosBtn) {
    const { id, nombre } = turnosBtn.dataset;
    verTurnos(id, nombre);
  }
});

/* === FORMULARIOS === */
["editVetForm", "addVetForm"].forEach((formId) => {
  document.getElementById(formId).addEventListener("submit", async (e) => {
    e.preventDefault();
    const isEdit = formId === "editVetForm";
    const id = document.getElementById(
      isEdit ? "editIdVet" : "addIdVet"
    )?.value;
    const prefix = isEdit ? "edit" : "add";

    const data = {
      Vet_Nombres: document.getElementById(`${prefix}Nombre`).value,
      Vet_Apellidos: document.getElementById(`${prefix}Apellido`).value,
      Vet_Telefono: document.getElementById(`${prefix}Telefono`).value,
      Vet_Correo: document.getElementById(`${prefix}Correo`).value,
      EspecialidadNombre: document.getElementById(`${prefix}Especialidad`)
        .value,
    };

    try {
      await saveVeterinario(
        isEdit ? "PUT" : "POST",
        isEdit ? `${API_URL}/${id}` : API_URL,
        data
      );
      alert(`Veterinario ${isEdit ? "actualizado" : "agregado"} correctamente`);
      closeModal(isEdit ? "modalEditar" : "modalAgregar");
    } catch (error) {
      console.error(error);
      alert("Error al guardar veterinario");
    }
  });
});

/* === CERRAR MODALES === */
// Los modales se cierran automáticamente con form method="dialog"
// Pero mantenemos los event listeners por si acaso
function initModalCloseListeners() {
  const closeEditModal = document.getElementById("closeEditModal");
  const cancelEdit = document.getElementById("cancelEdit");
  const closeAddModal = document.getElementById("closeAddModal");
  const cancelAdd = document.getElementById("cancelAdd");

  if (closeEditModal) {
    closeEditModal.addEventListener("click", () => closeModal("modalEditar"));
  }
  if (cancelEdit) {
    cancelEdit.addEventListener("click", () => closeModal("modalEditar"));
  }
  if (closeAddModal) {
    closeAddModal.addEventListener("click", () => closeModal("modalAgregar"));
  }
  if (cancelAdd) {
    cancelAdd.addEventListener("click", () => closeModal("modalAgregar"));
  }
}

// ===== EXPORTACIONES =====
function initVeterinariosExport() {
  const btnCSV = document.getElementById("btnDownloadCSV");
  const btnJSON = document.getElementById("btnDownloadJSON");
  const btnPDF = document.getElementById("btnDownloadPDF");
  const btnXLSX = document.getElementById("btnDownloadXLSX");

  if (btnCSV) {
    btnCSV.addEventListener("click", () => exportReport("csv"));
  }

  if (btnJSON) {
    btnJSON.addEventListener("click", () => exportReport("json"));
  }

  if (btnPDF) {
    btnPDF.addEventListener("click", () => exportReport("pdf"));
  }

  if (btnXLSX) {
    btnXLSX.addEventListener("click", () => exportReport("xlsx"));
  }
}

async function exportReport(type) {
  try {
    const res = await fetch(REPORT_URL);
    const data = await res.json();
    console.log(data);
    const resgistro = data.data;
    if (!data.data.length) return alert("No hay datos para exportar.");

    switch (type) {
      case "json": {
        downloadFile(
          new Blob([JSON.stringify(resgistro, null, 2)], {
            type: "application/json",
          }),
          "reporte_veterinarios.json"
        );
        break;
      }

      case "csv": {
        const csv = convertToCSV(resgistro);
        downloadFile(
          new Blob([csv], { type: "text/csv" }),
          "reporte_veterinarios.csv"
        );
        break;
      }

      case "xlsx": {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(resgistro);
        XLSX.utils.book_append_sheet(wb, ws, "Veterinarios");
        XLSX.writeFile(wb, "reporte_veterinarios.xlsx");
        break;
      }

      case "pdf": {
        const doc = new jsPDF();
        doc.text("Reporte de Veterinarios", 14, 15);
        autoTable(doc, {
          startY: 20,
          head: [
            [
              "ID",
              "Nombre",
              "Apellido",
              "Correo",
              "Teléfono",
              "Especialidad",
              "Estado",
              "Creado",
              "Actualizado",
            ],
          ],
          body: resgistro.map((v) => [
            v.id_Veterinario,
            v.Vet_Nombres,
            v.Vet_Apellidos,
            v.Vet_Correo || "",
            v.Vet_Telefono || "",
            v.Especialidad || "",
            v.Estado,
            formatDate(v.created_at),
            formatDate(v.updated_at),
          ]),
          styles: { fontSize: 8 },
        });
        doc.save("reporte_veterinarios.pdf");
        break;
      }
    }
  } catch (error) {
    console.error("Error al exportar:", error);
    alert("Error al generar el reporte.");
  }
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleString("es-EC");
}

function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function convertToCSV(resgistro) {
  const headers = Object.keys(resgistro[0]);
  const rows = resgistro.map((obj) =>
    headers.map((h) => obj[h] ?? "").join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

/* ========== FUNCIONES GLOBALES ========== */
window.verTurnos = verTurnos;
window.cerrarModalTurnos = cerrarModalTurnos;
window.addVeterinarian = function () {
  cargarEspecialidades("addEspecialidad");
  openModal("modalAgregar");
};

/* ========== INICIALIZACIÓN ========== */
async function initDashboard() {
  highlightActive();
  initMobileMenu();
  initModalCloseListeners();
  await fetchVeterinarios();
  initVeterinariosExport();
  createIcons(iconConfig);
}

document.addEventListener("DOMContentLoaded", initDashboard);
