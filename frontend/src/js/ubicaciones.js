import { createIcons, icons } from "lucide";

import { config as envConfig } from "@/config/env.js";

const iconConfig = {
  icons: {
    LayoutDashboard: icons.LayoutDashboard,
    Users: icons.Users,
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
  },
};

const tableConfigs = {
  "estado-general": {
    tableName: "estado-general",
    idField: "Gen_id_estado_general",
    mainFields: ["Gen_nombre", "Gen_es_activo"],
    allFields: ["Gen_modulo_origen", "Gen_nombre", "Gen_es_activo", "Gen_descripcion"],
  },
  provincia: {
    tableName: "provincia",
    idField: "Gen_id_provincia",
    mainFields: ["Gen_nombre", "Gen_codigo_pais"],
    allFields: ["Gen_modulo_origen", "Gen_nombre", "Gen_codigo_pais", "Gen_id_estado_general"],
  },
  ciudad: {
    tableName: "ciudad",
    idField: "Gen_id_ciudad",
    mainFields: ["Gen_nombre", "Gen_id_provincia"],
    allFields: ["Gen_modulo_origen", "Gen_nombre", "Gen_id_provincia", "Gen_id_estado_general"],
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
      document.querySelector(`[data-content="${targetTab}"]`).classList.add("active");

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
                  <button class="btn btn-sm btn-primary" onclick="editRecord('${tableKey}', '${
                row[config.idField]
              }')">
                    <i data-lucide="edit"></i> Editar
                  </button>
                  <button class="btn btn-sm btn-danger" onclick="deleteRecord('${tableKey}', '${
                row[config.idField]
              }')">
                    <i data-lucide="trash2"></i> Eliminar
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
    title.textContent = `Nuevo ${tableKey === "estado-general" ? "Estado General" : tableKey === "provincia" ? "Provincia" : "Ciudad"}`;
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
      title.textContent = `Editar ${tableKey === "estado-general" ? "Estado General" : tableKey === "provincia" ? "Provincia" : "Ciudad"}`;
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
    const API_URL = `${envConfig.BACKEND_URL}/v1/${config.tableName}${
      editingId ? `/${editingId}` : ""
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

window.editRecord = editRecord;
window.deleteRecord = deleteRecord;
window.handleSubmit = handleSubmit;
window.openModal = openModal;

function init() {
  highlightActive();
  initMobileMenu();
  initTabs();
  loadTableData("estado-general");
  createIcons(iconConfig);
}

document.addEventListener("DOMContentLoaded", init);

