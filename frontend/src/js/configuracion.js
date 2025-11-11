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
  iva: {
    tableName: "iva",
    idField: "Gen_id_iva",
    mainFields: ["Gen_nombre", "Gen_porcentaje"],
    allFields: [
      "Gen_modulo_origen",
      "Gen_nombre",
      "Gen_porcentaje",
      "Gen_fecha_vigencia_inicio",
      "Gen_fecha_vigencia_fin",
      "Gen_id_estado_general",
    ],
  },
  "unidad-medida": {
    tableName: "unidad-medida",
    idField: "Gen_id_unidad_medida",
    mainFields: ["Gen_codigo", "Gen_nombre"],
    allFields: [
      "Gen_modulo_origen",
      "Gen_codigo",
      "Gen_nombre",
      "Gen_tipo_unidad",
      "Gen_id_estado_general",
    ],
  },
  "metodo-pago": {
    tableName: "metodo-pago",
    idField: "Gen_id_metodo_pago",
    mainFields: ["Gen_nombre"],
    allFields: [
      "Gen_modulo_origen",
      "Gen_nombre",
      "Gen_descripcion",
      "Gen_id_estado_general",
    ],
  },
  operadora: {
    tableName: "operadora",
    idField: "Gen_id_operadora",
    mainFields: ["Gen_nombre"],
    allFields: ["Gen_modulo_origen", "Gen_nombre", "Gen_id_estado_general"],
  },
};

let editingIds = {
  iva: null,
  "unidad-medida": null,
  "metodo-pago": null,
  operadora: null,
};

// Resalta el elemento activo en el sidebar
function highlightActive() {
  const currentPath = window.location.pathname;
  const navItems = document.querySelectorAll(".sidebar-nav-item");
  navItems.forEach((a) => {
    const href = a.getAttribute("href");
    const isActive =
      href === currentPath || (currentPath === "/index.html" && href === "/");
    a.classList.toggle("sidebar-nav-item-active", isActive);
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
                    `<td>${
                      row[field] !== null && row[field] !== undefined
                        ? String(row[field])
                        : ""
                    }</td>`
                )
                .join("")}
              <td>
                <div class="table-actions">
                  <button class="btn-edit" onclick="editRecord('${tableKey}', '${
                row[config.idField]
              }')" title="Editar">
                    <i data-lucide="edit"></i>
                  </button>
                  <button class="btn-delete" onclick="deleteRecord('${tableKey}', '${
                row[config.idField]
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

  const titles = {
    iva: "Nuevo IVA",
    "unidad-medida": "Nueva Unidad Medida",
    "metodo-pago": "Nuevo Método Pago",
    operadora: "Nueva Operadora",
  };

  if (title) {
    title.textContent = titles[tableKey] || `Nuevo ${tableKey}`;
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

    const titles = {
      iva: "Editar IVA",
      "unidad-medida": "Editar Unidad Medida",
      "metodo-pago": "Editar Método Pago",
      operadora: "Editar Operadora",
    };

    if (title) {
      title.textContent = titles[tableKey] || `Editar ${tableKey}`;
    }

    if (form) {
      Object.keys(data).forEach((key) => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) {
          if (input.type === "checkbox") {
            input.checked = data[key] === 1 || data[key] === true;
          } else if (input.type === "date") {
            if (data[key]) {
              const date = new Date(data[key]);
              input.value = date.toISOString().split("T")[0];
            }
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

  data.Gen_modulo_origen = 1;
  data.Gen_id_estado_general = 1;

  try {
    const editingId = editingIds[tableKey];
    const API_URL = `${envConfig.BACKEND_URL}/v1/${config.tableName}${
      editingId ? `/${editingId}` : ""
    }`;
    const method = editingId ? "PUT" : "POST";

    const response = await fetch(API_URL, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      if (error.error) {
        if (error.error.includes("chk_Gen_IVA_fechas_validas")) {
          throw new Error(
            "La fecha de fin de vigencia no puede ser anterior a la fecha de inicio de vigencia"
          );
        }
      }

      throw new Error(`HTTP error! status: ${response.status}`);
    }

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
          `Reporte de ${
            entityName.charAt(0).toUpperCase() + entityName.slice(1)
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

function initConfiguracionExports() {
  const baseUrl = envConfig.BACKEND_URL;

  initEntityExport("IVA", `${baseUrl}/v1/iva`, {
    pdfHeaders: ["ID", "Nombre", "Porcentaje", "Fecha Inicio", "Fecha Fin"],
    pdfRowMapper: (row) => [
      row.Gen_id_iva,
      row.Gen_nombre || "",
      row.Gen_porcentaje || "",
      row.Gen_fecha_vigencia_inicio || "",
      row.Gen_fecha_vigencia_fin || "",
    ],
  });

  initEntityExport("UnidadMedida", `${baseUrl}/v1/unidad-medida`, {
    pdfHeaders: ["ID", "Código", "Nombre", "Tipo Unidad"],
    pdfRowMapper: (row) => [
      row.Gen_id_unidad_medida,
      row.Gen_codigo || "",
      row.Gen_nombre || "",
      row.Gen_tipo_unidad || "",
    ],
  });

  initEntityExport("MetodoPago", `${baseUrl}/v1/metodo-pago`, {
    pdfHeaders: ["ID", "Nombre", "Descripción"],
    pdfRowMapper: (row) => [
      row.Gen_id_metodo_pago,
      row.Gen_nombre || "",
      row.Gen_descripcion || "",
    ],
  });

  initEntityExport("Operadora", `${baseUrl}/v1/operadora`, {
    pdfHeaders: ["ID", "Nombre"],
    pdfRowMapper: (row) => [row.Gen_id_operadora, row.Gen_nombre || ""],
  });
}

function initDashboard() {
  highlightActive();
  initMobileMenu();
  initTabs();
  loadTableData("iva");
  initConfiguracionExports();
  createIcons(iconConfig);
}

window.editRecord = editRecord;
window.deleteRecord = deleteRecord;
window.handleSubmit = handleSubmit;
window.openModal = openModal;

document.addEventListener("DOMContentLoaded", initDashboard);
