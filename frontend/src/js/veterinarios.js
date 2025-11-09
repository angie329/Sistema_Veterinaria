import { createIcons, icons } from "lucide";
import { verTurnos, cerrarModalTurnos } from "./turnos.js";
import { cargarEspecialidades } from "./especialidades.js";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const REPORT_URL = `${import.meta.env.VITE_BACKEND_URL}/v1/reportes/veterinarios`;
window.cerrarModalTurnos = cerrarModalTurnos;
window.verTurnos = verTurnos;

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/v1/veterinarios`;

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

function initIcons() {
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
      Pencil: icons.Pencil,
      Trash: icons.Trash,
      X: icons.X,
    FileText: icons.FileText,              
    FileSpreadsheet: icons.FileSpreadsheet, 
    FileCode: icons.FileCode,              
    Braces: icons.Braces,
      File: icons.File,
    },
  });
}

function initMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.querySelector(".sidebar-overlay");

  if (!mobileMenuBtn || !sidebar) return;

  mobileMenuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("sidebar-open");
    overlay?.classList.toggle("overlay-visible");
  });

  overlay?.addEventListener("click", () => {
    sidebar.classList.remove("sidebar-open");
    overlay.classList.remove("overlay-visible");
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      sidebar.classList.remove("sidebar-open");
      overlay?.classList.remove("overlay-visible");
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
            <button class="btn-turnos" data-id="${vet.id_Veterinario}" data-nombre="${vet.Vet_Nombres}">
              Ver turnos
            </button>
          </td>
          <td>
            <div class="actions">
              <button class="action-btn edit" data-vet='${JSON.stringify(vet)}'><i data-lucide="pencil"></i></button>
              <button class="action-btn delete" data-id="${vet.id_Veterinario}"><i data-lucide="trash"></i></button>
            </div>
          </td>
        </tr>`
      )
      .join("")
    : `<tr><td colspan="6" style="text-align:center; color:#888;">No hay veterinarios registrados</td></tr>`;

  createIcons({ icons }); // render icons dinámicos
}

/* ========== FUNCIONES AUXILIARES ========== */
function toggleModal(id, show = true) {
  document.getElementById(id).style.display = show ? "flex" : "none";
}

/* ========== EDITAR VETERINARIO ========== */
async function abrirModalEditar(vet) {
  toggleModal("modalEditar", true);
  document.getElementById("editIdVet").value = vet.id_Veterinario;
  document.getElementById("editNombre").value = vet.Vet_Nombres;
  document.getElementById("editApellido").value = vet.Vet_Apellidos;
  document.getElementById("editTelefono").value = vet.Vet_Telefono || "";
  document.getElementById("editCorreo").value = vet.Vet_Correo || "";
  await cargarEspecialidades("editEspecialidad", vet.Especialidad);
}

/* ========== AGREGAR VETERINARIO ========== */
window.addVeterinarian = async function () {
  toggleModal("modalAgregar", true);
  await cargarEspecialidades("addEspecialidad");
};

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
    const id = document.getElementById(isEdit ? "editIdVet" : "addIdVet")?.value;
    const prefix = isEdit ? "edit" : "add";

    const data = {
      Vet_Nombres: document.getElementById(`${prefix}Nombre`).value,
      Vet_Apellidos: document.getElementById(`${prefix}Apellido`).value,
      Vet_Telefono: document.getElementById(`${prefix}Telefono`).value,
      Vet_Correo: document.getElementById(`${prefix}Correo`).value,
      EspecialidadNombre: document.getElementById(`${prefix}Especialidad`).value,
    };

    try {
      await saveVeterinario(
        isEdit ? "PUT" : "POST",
        isEdit ? `${API_URL}/${id}` : API_URL,
        data
      );
      alert(`Veterinario ${isEdit ? "actualizado" : "agregado"} correctamente`);
      toggleModal(isEdit ? "modalEditar" : "modalAgregar", false);
    } catch (error) {
      console.error(error);
      alert("Error al guardar veterinario");
    }
  });
});

/* === CERRAR MODALES === */
["closeEditModal", "cancelEdit", "closeAddModal", "cancelAdd"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("click", () => toggleModal(id.includes("Add") ? "modalAgregar" : "modalEditar", false));
});



// ===== EXPORTACIONES =====
document.getElementById("btnDownloadCSV")?.addEventListener("click", () => exportReport("csv"));
document.getElementById("btnDownloadJSON")?.addEventListener("click", () => exportReport("json"));
document.getElementById("btnDownloadPDF")?.addEventListener("click", () => exportReport("pdf"));
document.getElementById("btnDownloadXLSX")?.addEventListener("click", () => exportReport("xlsx"));

async function exportReport(type) {
  try {
    const res = await fetch(REPORT_URL);
    const data = await res.json()
    console.log(data);
     const  resgistro=data.data;
    if (!data.data.length) return alert("No hay datos para exportar.");

    switch (type) {
      case "json":
        downloadFile(new Blob([JSON.stringify(resgistro, null, 2)], { type: "application/json" }), "reporte_veterinarios.json");
        break;

      case "csv":
        const csv = convertToCSV(resgistro);
        downloadFile(new Blob([csv], { type: "text/csv" }), "reporte_veterinarios.csv");
        break;

      case "xlsx":
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(resgistro);
        XLSX.utils.book_append_sheet(wb, ws, "Veterinarios");
        XLSX.writeFile(wb, "reporte_veterinarios.xlsx");
        break;

      case "pdf":
        const doc = new jsPDF();
        doc.text("Reporte de Veterinarios", 14, 15);
        autoTable(doc, {
          startY: 20,
          head: [["ID", "Nombre", "Apellido", "Correo", "Teléfono", "Especialidad", "Estado", "Creado", "Actualizado"]],
          body: resgistro.map(v => [
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
  const rows = resgistro.map(obj => headers.map(h => obj[h] ?? "").join(","));
  return [headers.join(","), ...rows].join("\n");
}



/* ========== INICIALIZACIÓN ========== */
function initDashboard() {
  highlightActive();
  initMobileMenu();
  initIcons();
  fetchVeterinarios();
}
document.addEventListener("DOMContentLoaded", initDashboard);


