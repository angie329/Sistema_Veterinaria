import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { createIcons, icons } from "lucide";

import { config as envConfig } from "@/config/env.js";

const iconConfig = {
  icons: {
    LayoutDashboard: icons.LayoutDashboard,
    Users: icons.Users,
    Dog: icons.Dog,
    Stethoscope: icons.Stethoscope,
    Search: icons.Search,
    Bell: icons.Bell,
    ChevronDown: icons.ChevronDown,
    Menu: icons.Menu,
    Edit: icons.Edit,
    Trash2: icons.Trash2,
    Save: icons.Save,
    X: icons.X,
    MapPin: icons.MapPin,
    User: icons.User,
    Settings: icons.Settings,
    Plus: icons.Plus,
    FileText: icons.FileText,
    Braces: icons.Braces,
    File: icons.File,
    FileSpreadsheet: icons.FileSpreadsheet,
  },
};

const tableConfigs = {
  "estado-general": {
    tableName: "estado-general",
    idField: "Gen_id_estado_general",
    mainFields: ["Gen_nombre", "Gen_es_activo"],
    allFields: [
      "Gen_modulo_origen",
      "Gen_nombre",
      "Gen_es_activo",
      "Gen_descripcion",
    ],
  },
  provincia: {
    tableName: "provincia",
    idField: "Gen_id_provincia",
    mainFields: ["Gen_nombre", "Gen_codigo_pais"],
    allFields: [
      "Gen_modulo_origen",
      "Gen_nombre",
      "Gen_codigo_pais",
      "Gen_id_estado_general",
    ],
  },
  ciudad: {
    tableName: "ciudad",
    idField: "Gen_id_ciudad",
    mainFields: ["Gen_nombre", "Gen_id_provincia"],
    allFields: [
      "Gen_modulo_origen",
      "Gen_nombre",
      "Gen_id_provincia",
      "Gen_id_estado_general",
    ],
  },
};

let editingIds = {
  "estado-general": null,
  provincia: null,
  ciudad: null,
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

function initTabs() {
  const tabs = document.querySelectorAll(".tab");
  const tabContents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetTab = tab.getAttribute("data-tab");

      tabs.forEach((t) => t.classList.remove("active"));
      tabContents.forEach((tc) => tc.classList.remove("active"));

      tab.classList.add("active");
      document
        .querySelector(`[data-content="${targetTab}"]`)
        .classList.add("active");

      loadTableData(targetTab);
    });
  });
}

async function loadTableData(tableKey) {
  const config = tableConfigs[tableKey];
  if (!config) return;

  const container = document.getElementById(`table-${tableKey}`);
  if (!container) return;

  container.innerHTML = "<div class='loading'>Cargando...</div>";

  try {
    const API_URL = `${envConfig.BACKEND_URL}/v1/${config.tableName}`;
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    if (data.length === 0) {
      container.innerHTML =
        "<div class='empty-state'><p class='empty-state-message'>No hay datos</p></div>";
      return;
    }

    const tableHTML = `
      <table class="data-table">
        <thead>
          <tr>
            ${config.mainFields.map((field) => `<th>${field}</th>`).join("")}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${data
        .map(
          (row) => `
            <tr>
              ${config.mainFields
              .map(
                (field) =>
                  `<td>${row[field] !== null && row[field] !== undefined
                    ? String(row[field])
                    : ""
                  }</td>`
              )
              .join("")}
              <td>
                <div class="table-actions">
                  <button class="btn-edit" onclick="editRecord('${tableKey}', '${row[config.idField]
            }')" title="Editar">
                    <i data-lucide="edit"></i>
                  </button>
                  <button class="btn-delete" onclick="deleteRecord('${tableKey}', '${row[config.idField]
            }')" title="Eliminar">
                    <i data-lucide="trash2"></i>
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
    console.error("Error loading table data:", error);
    container.innerHTML = `<div class='empty-state'><p class='empty-state-message'>Error: ${error.message}</p></div>`;
  }
}

function openModal(tableKey) {
  editingIds[tableKey] = null;
  const modal = document.getElementById(`modal-${tableKey}`);
  const title = document.getElementById(`modal-title-${tableKey}`);
  const form = document.getElementById(`form-${tableKey}`);

  if (title) {
    title.textContent = `Nuevo ${tableKey === "estado-general"
        ? "Estado General"
        : tableKey === "provincia"
          ? "Provincia"
          : "Ciudad"
      }`;
  }

  if (form) {
    form.reset();
  }

  if (modal) {
    modal.showModal();
    createIcons(iconConfig);
  }
}

async function editRecord(tableKey, id) {
  const config = tableConfigs[tableKey];
  if (!config) return;

  try {
    const API_URL = `${envConfig.BACKEND_URL}/v1/${config.tableName}/${id}`;
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    editingIds[tableKey] = id;
    const modal = document.getElementById(`modal-${tableKey}`);
    const title = document.getElementById(`modal-title-${tableKey}`);
    const form = document.getElementById(`form-${tableKey}`);

    if (title) {
      title.textContent = `Editar ${tableKey === "estado-general"
          ? "Estado General"
          : tableKey === "provincia"
            ? "Provincia"
            : "Ciudad"
        }`;
    }

    if (form) {
      Object.keys(data).forEach((key) => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) {
          if (input.type === "checkbox") {
            input.checked = data[key] === 1 || data[key] === true;
          } else {
            input.value = data[key] || "";
          }
        }
      });
    }

    if (modal) {
      modal.showModal();
      createIcons(iconConfig);
    }
  } catch (error) {
    console.error("Error loading record:", error);
    alert(`Error: ${error.message}`);
  }
}

async function deleteRecord(tableKey, id) {
  if (!confirm("¿Está seguro de eliminar este registro?")) return;

  const config = tableConfigs[tableKey];
  if (!config) return;

  try {
    const API_URL = `${envConfig.BACKEND_URL}/v1/${config.tableName}/${id}`;
    const response = await fetch(API_URL, { method: "DELETE" });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    loadTableData(tableKey);
    alert("Eliminado correctamente");
  } catch (error) {
    console.error("Error deleting record:", error);
    alert(`Error: ${error.message}`);
  }
}

async function handleSubmit(event, tableKey) {
  event.preventDefault();

  const config = tableConfigs[tableKey];
  if (!config) return;

  const form = event.target;
  const formData = new FormData(form);
  const data = {};

  for (const [key, value] of formData.entries()) {
    const input = form.querySelector(`[name="${key}"]`);
    if (input && input.type === "checkbox") {
      data[key] = input.checked;
    } else {
      data[key] = value || null;
    }
  }

  // Add default fields
  if (tableKey === "estado-general") {
    data.Gen_modulo_origen = 1;
    if (!data.Gen_es_activo) data.Gen_es_activo = false;
  } else if (tableKey === "provincia") {
    data.Gen_modulo_origen = 1;
    data.Gen_id_estado_general = 1;
    if (!data.Gen_codigo_pais) data.Gen_codigo_pais = "EC";
  } else if (tableKey === "ciudad") {
    data.Gen_modulo_origen = 1;
    data.Gen_id_estado_general = 1;
    if (!data.Gen_id_provincia) data.Gen_id_provincia = 1;
  }

  try {
    const editingId = editingIds[tableKey];
    const API_URL = `${envConfig.BACKEND_URL}/v1/${config.tableName}${editingId ? `/${editingId}` : ""
      }`;
    const method = editingId ? "PUT" : "POST";

    const response = await fetch(API_URL, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const modal = document.getElementById(`modal-${tableKey}`);
    if (modal) {
      modal.close();
    }

    editingIds[tableKey] = null;
    form.reset();
    loadTableData(tableKey);
    alert(editingId ? "Actualizado correctamente" : "Creado correctamente");
  } catch (error) {
    console.error("Error saving data:", error);
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
          `Reporte de ${entityName.charAt(0).toUpperCase() + entityName.slice(1)
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

// Inicializar exportación para todas las entidades de ubicaciones
function initUbicacionesExports() {
  const baseUrl = envConfig.BACKEND_URL;

  // Estado General
  initEntityExport("EstadoGeneral", `${baseUrl}/v1/estado-general`, {
    pdfHeaders: ["ID", "Nombre", "Activo", "Descripción"],
    pdfRowMapper: (row) => [
      row.Gen_id_estado_general,
      row.Gen_nombre || "",
      row.Gen_es_activo ? "Sí" : "No",
      row.Gen_descripcion || "",
    ],
  });

  // Provincia
  initEntityExport("Provincia", `${baseUrl}/v1/provincia`, {
    pdfHeaders: ["ID", "Nombre", "Código País"],
    pdfRowMapper: (row) => [
      row.Gen_id_provincia,
      row.Gen_nombre || "",
      row.Gen_codigo_pais || "",
    ],
  });

  // Ciudad
  initEntityExport("Ciudad", `${baseUrl}/v1/ciudad`, {
    pdfHeaders: ["ID", "Nombre", "Provincia"],
    pdfRowMapper: (row) => [
      row.Gen_id_ciudad,
      row.Gen_nombre || "",
      row.Gen_id_provincia || "",
    ],
  });
}

window.editRecord = editRecord;
window.deleteRecord = deleteRecord;
window.handleSubmit = handleSubmit;
window.openModal = openModal;

function initDashboard() {
  highlightActive();
  initMobileMenu();
  initTabs();
  loadTableData("estado-general");
  initUbicacionesExports();
  createIcons(iconConfig);
}

document.addEventListener("DOMContentLoaded", initDashboard);
