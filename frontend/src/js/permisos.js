import { createIcons, icons } from "lucide";
import { login, logout, isLoggedIn, getUser, authHeader } from "@/js/auth.js";
import { config } from "@/config/env.js";

const API_URL = `${config.BACKEND_URL}/v1/aut`;

const iconConfig = {
  icons: {
    UserCog: icons.UserCog,
    Shield: icons.Shield,
    Lock: icons.Lock,
    Key: icons.Key,
    FileText: icons.FileText,
    LogIn: icons.LogIn,
    LogOut: icons.LogOut,
    Edit2: icons.Edit2,
    Trash2: icons.Trash2,
    Save: icons.Save,
    RefreshCw: icons.RefreshCw,
    Loader: icons.Loader,
    Plus: icons.Plus,
    X: icons.X,
    Search: icons.Search,
    Bell: icons.Bell,
    ChevronDown: icons.ChevronDown,
    LayoutDashboard: icons.LayoutDashboard,
    Users: icons.Users,
    Menu: icons.Menu,
  },
};

// ========== UTILIDADES ==========
function initials(name) {
  if (!name) return "??";
  return name.split(" ").map(s=>s[0]).join("").slice(0,2).toUpperCase();
}

function showToast(message, type = "success") {
  alert(message);
}

// ========== AUTH UI ==========
function setupAuthUI() {
  const authItem = document.getElementById("sidebarAuthItem");
  const userBtn = document.getElementById("userMenuBtn");
  const avatar = userBtn?.querySelector(".header-avatar");
  const nameSpan = userBtn?.querySelector("span");

  if (isLoggedIn()) {
    const u = getUser();
    if (authItem) {
      const spanEl = authItem.querySelector("span");
      const iconEl = authItem.querySelector("i");
      if (spanEl) spanEl.textContent = "Cerrar sesión";
      if (iconEl) iconEl.setAttribute("data-lucide","log-out");
      authItem.onclick = (e)=>{ e.preventDefault(); logout(); };
    }
    if (avatar) avatar.textContent = initials(u?.username || "Usuario");
    if (nameSpan) nameSpan.textContent = u?.username || "Usuario";
  } else {
    if (authItem) {
      const spanEl = authItem.querySelector("span");
      const iconEl = authItem.querySelector("i");
      if (spanEl) spanEl.textContent = "Iniciar sesión";
      if (iconEl) iconEl.setAttribute("data-lucide","log-in");
      authItem.onclick = (e)=>{ e.preventDefault(); openLoginModal(); };
    }
    if (avatar) avatar.textContent = "IN";
    if (nameSpan) nameSpan.textContent = "Invitado";
  }
  createIcons(iconConfig);
}

function openLoginModal() {
  const modal = document.getElementById("loginModal");
  if (!modal) return;
  modal.style.display = "flex";
  
  const cancelBtn = document.getElementById("loginCancel");
  const loginForm = document.getElementById("loginForm");
  
  if (cancelBtn) {
    cancelBtn.onclick = ()=> {
      modal.style.display = "none";
    };
  }
  
  if (loginForm) {
    loginForm.onsubmit = async (e)=>{
      e.preventDefault();
      const u = document.getElementById("loginUser").value.trim();
      const p = document.getElementById("loginPass").value.trim();
      try {
        await login(u,p);
        modal.style.display = "none";
        setupAuthUI();
        loadPermisos();
      } catch (err) {
        showToast(err.message || "Error de login", "error");
      }
    };
  }
}

// ========== API CALLS ==========
async function fetchPermisos() {
  const res = await fetch(`${API_URL}/permisos`, {
    headers: authHeader()
  });
  if (!res.ok) throw new Error("Error al cargar permisos");
  return res.json();
}

async function fetchRoles() {
  const res = await fetch(`${API_URL}/roles`, {
    headers: authHeader()
  });
  if (!res.ok) throw new Error("Error al cargar roles");
  return res.json();
}

async function createPermiso(data) {
  const res = await fetch(`${API_URL}/permisos`, {
    method: "POST",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al crear permiso");
  }
  return res.json();
}

async function updatePermiso(id, data) {
  const res = await fetch(`${API_URL}/permisos/${id}`, {
    method: "PUT",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al actualizar permiso");
  }
  return res.json();
}

async function deletePermiso(id) {
  const res = await fetch(`${API_URL}/permisos/${id}`, {
    method: "DELETE",
    headers: authHeader()
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al eliminar permiso");
  }
  return res.json();
}

// ========== RENDER ==========
async function loadPermisos() {
  const tbody = document.getElementById("permisosTableBody");
  tbody.innerHTML = '<tr><td colspan="4" class="text-center"><div class="loading"><i data-lucide="loader"></i> Cargando...</div></td></tr>';
  createIcons(iconConfig);
  
  try {
    const permisos = await fetchPermisos();
    
    if (!permisos || permisos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center">No hay permisos registrados</td></tr>';
      return;
    }

    tbody.innerHTML = permisos.map(p => {
      const nombreFormateado = (p.aut_pantalla || "").replace(/\//g, " › ");
      const descripcion = p.aut_descripcion || p.aut_codigo_permiso || "-";
      
      return `
        <tr>
          <td><strong>${nombreFormateado}</strong></td>
          <td>${descripcion}</td>
          <td><span class="badge badge-info">${p.roles_asignados || 0}</span></td>
          <td class="table-actions">
            <button class="btn-icon btn-edit" data-id="${p.id_aut_permiso}" title="Editar">
              <i data-lucide="edit-2"></i>
            </button>
            <button class="btn-icon btn-delete" data-id="${p.id_aut_permiso}" title="Eliminar">
              <i data-lucide="trash-2"></i>
            </button>
          </td>
        </tr>
      `;
    }).join("");

    createIcons(iconConfig);
    attachRowActions();
  } catch (err) {
    console.error("Error al cargar permisos:", err);
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-error">Error: ${err.message}</td></tr>`;
  }
}

function attachRowActions() {
  document.querySelectorAll(".btn-edit").forEach(btn => {
    btn.onclick = () => openEditPermisoModal(btn.dataset.id);
  });
  document.querySelectorAll(".btn-delete").forEach(btn => {
    btn.onclick = () => handleDelete(btn.dataset.id);
  });
}

async function handleDelete(id) {
  if (!confirm("¿Está seguro de eliminar este permiso?")) return;
  
  try {
    await deletePermiso(id);
    showToast("Permiso eliminado correctamente");
    loadPermisos();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ========== MODALES - CREAR ==========
function openCreatePermisoModal() {
  const html = `
    <div id="permisoModal" class="modal" style="display: flex;">
      <div class="modal-content modal-sm">
        <div class="modal-header">
          <h2 class="modal-title">Nuevo Permiso</h2>
          <button class="modal-close" id="closePermisoModal">
            <i data-lucide="x"></i>
          </button>
        </div>
        <form id="permisoForm" class="form-grid" style="padding: 20px;">
          <div>
            <label class="form-label">Pantalla *</label>
            <input type="text" id="pantalla" class="input" required placeholder="/clientes/lista" />
          </div>
          <div>
            <label class="form-label">Vista</label>
            <input type="text" id="vista" class="input" placeholder="Lista Clientes" />
          </div>
          <div>
            <label class="form-label">Formulario</label>
            <input type="text" id="formulario" class="input" placeholder="form_cliente" />
          </div>
          <div>
            <label class="form-label">Módulo Sistema *</label>
            <select id="modulo_sistema" class="input" required>
              <option value="">Seleccionar...</option>
              <option value="GEN">General</option>
              <option value="MAS">Mascotas</option>
              <option value="CLI">Clientes</option>
              <option value="VET">Veterinarios</option>
              <option value="CIT">Citas</option>
              <option value="FAC">Facturación</option>
              <option value="INV">Inventario</option>
            </select>
          </div>
          <div>
            <label class="form-label">Tipo Permiso *</label>
            <select id="tipo_permiso" class="input" required>
              <option value="">Seleccionar...</option>
              <option value="crear">Crear</option>
              <option value="leer">Leer</option>
              <option value="actualizar">Actualizar</option>
              <option value="eliminar">Eliminar</option>
            </select>
          </div>
          <div>
            <label class="form-label">Código Permiso</label>
            <input type="text" id="codigo_permiso" class="input" placeholder="CLI_CREAR" />
          </div>
          <div style="grid-column: 1 / -1;">
            <label class="form-label">Descripción</label>
            <textarea id="descripcion" class="input" rows="3" placeholder="Descripción del permiso"></textarea>
          </div>
          <div style="grid-column: 1 / -1; display: flex; gap: 12px; justify-content: flex-end;">
            <button type="button" class="btn btn-secondary" id="cancelPermisoBtn">Cancelar</button>
            <button type="submit" class="btn btn-primary">Crear Permiso</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', html);
  createIcons(iconConfig);
  
  document.getElementById('closePermisoModal').onclick = closePermisoModal;
  document.getElementById('cancelPermisoBtn').onclick = closePermisoModal;
  document.getElementById('permisoForm').onsubmit = handleCreatePermiso;
}

function closePermisoModal() {
  const modal = document.getElementById('permisoModal');
  if (modal) modal.remove();
}

async function handleCreatePermiso(e) {
  e.preventDefault();
  
  const data = {
    pantalla: document.getElementById('pantalla').value.trim(),
    vista: document.getElementById('vista').value.trim(),
    formulario: document.getElementById('formulario').value.trim(),
    modulo_sistema: document.getElementById('modulo_sistema').value,
    tipo_permiso: document.getElementById('tipo_permiso').value,
    codigo_permiso: document.getElementById('codigo_permiso').value.trim(),
    descripcion: document.getElementById('descripcion').value.trim()
  };
  
  try {
    await createPermiso(data);
    closePermisoModal();
    showToast("Permiso creado correctamente");
    loadPermisos();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ========== MODALES - EDITAR ==========
let currentPermisoData = null;

async function openEditPermisoModal(id) {
  try {
    const permisos = await fetchPermisos();
    currentPermisoData = permisos.find(p => p.id_aut_permiso == id);
    
    if (!currentPermisoData) {
      showToast("Permiso no encontrado", "error");
      return;
    }
    
    const html = `
      <div id="permisoModal" class="modal" style="display: flex;">
        <div class="modal-content modal-sm">
          <div class="modal-header">
            <h2 class="modal-title">Editar Permiso</h2>
            <button class="modal-close" id="closePermisoModal">
              <i data-lucide="x"></i>
            </button>
          </div>
          <form id="permisoForm" class="form-grid" style="padding: 20px;">
            <div>
              <label class="form-label">Pantalla *</label>
              <input type="text" id="pantalla" class="input" required value="${currentPermisoData.aut_pantalla || ''}" />
            </div>
            <div>
              <label class="form-label">Vista</label>
              <input type="text" id="vista" class="input" value="${currentPermisoData.aut_vista || ''}" />
            </div>
            <div>
              <label class="form-label">Formulario</label>
              <input type="text" id="formulario" class="input" value="${currentPermisoData.aut_formulario || ''}" />
            </div>
            <div>
              <label class="form-label">Módulo Sistema *</label>
              <select id="modulo_sistema" class="input" required>
                <option value="">Seleccionar...</option>
                <option value="GEN" ${currentPermisoData.aut_modulo_sistema === 'GEN' ? 'selected' : ''}>General</option>
                <option value="MAS" ${currentPermisoData.aut_modulo_sistema === 'MAS' ? 'selected' : ''}>Mascotas</option>
                <option value="CLI" ${currentPermisoData.aut_modulo_sistema === 'CLI' ? 'selected' : ''}>Clientes</option>
                <option value="VET" ${currentPermisoData.aut_modulo_sistema === 'VET' ? 'selected' : ''}>Veterinarios</option>
                <option value="CIT" ${currentPermisoData.aut_modulo_sistema === 'CIT' ? 'selected' : ''}>Citas</option>
                <option value="FAC" ${currentPermisoData.aut_modulo_sistema === 'FAC' ? 'selected' : ''}>Facturación</option>
                <option value="INV" ${currentPermisoData.aut_modulo_sistema === 'INV' ? 'selected' : ''}>Inventario</option>
              </select>
            </div>
            <div>
              <label class="form-label">Tipo Permiso *</label>
              <select id="tipo_permiso" class="input" required>
                <option value="">Seleccionar...</option>
                <option value="crear" ${currentPermisoData.aut_tipo_permiso === 'crear' ? 'selected' : ''}>Crear</option>
                <option value="leer" ${currentPermisoData.aut_tipo_permiso === 'leer' ? 'selected' : ''}>Leer</option>
                <option value="actualizar" ${currentPermisoData.aut_tipo_permiso === 'actualizar' ? 'selected' : ''}>Actualizar</option>
                <option value="eliminar" ${currentPermisoData.aut_tipo_permiso === 'eliminar' ? 'selected' : ''}>Eliminar</option>
              </select>
            </div>
            <div>
              <label class="form-label">Código Permiso</label>
              <input type="text" id="codigo_permiso" class="input" value="${currentPermisoData.aut_codigo_permiso || ''}" />
            </div>
            <div style="grid-column: 1 / -1;">
              <label class="form-label">Descripción</label>
              <textarea id="descripcion" class="input" rows="3">${currentPermisoData.aut_descripcion || ''}</textarea>
            </div>
            <div style="grid-column: 1 / -1; display: flex; gap: 12px; justify-content: flex-end;">
              <button type="button" class="btn btn-secondary" id="cancelPermisoBtn">Cancelar</button>
              <button type="submit" class="btn btn-primary">Guardar Cambios</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
    createIcons(iconConfig);
    
    document.getElementById('closePermisoModal').onclick = closePermisoModal;
    document.getElementById('cancelPermisoBtn').onclick = closePermisoModal;
    document.getElementById('permisoForm').onsubmit = handleEditPermiso;
    
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function handleEditPermiso(e) {
  e.preventDefault();
  
  if (!currentPermisoData) return;
  
  const data = {
    pantalla: document.getElementById('pantalla').value.trim(),
    vista: document.getElementById('vista').value.trim(),
    formulario: document.getElementById('formulario').value.trim(),
    modulo_sistema: document.getElementById('modulo_sistema').value,
    tipo_permiso: document.getElementById('tipo_permiso').value,
    codigo_permiso: document.getElementById('codigo_permiso').value.trim(),
    descripcion: document.getElementById('descripcion').value.trim(),
    estado: 'Activo'
  };
  
  try {
    await updatePermiso(currentPermisoData.id_aut_permiso, data);
    closePermisoModal();
    showToast("Permiso actualizado correctamente");
    loadPermisos();
    currentPermisoData = null;
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ========== ASIGNAR PERMISOS A ROL ==========
async function openAssignRoleModal() {
  try {
    const roles = await fetchRoles();
    const permisos = await fetchPermisos();
    
    const html = `
      <div id="assignModal" class="modal" style="display: flex;">
        <div class="modal-content modal-lg">
          <div class="modal-header">
            <h2 class="modal-title">Asignar Permisos a Rol</h2>
            <button class="modal-close" id="closeAssignModal">
              <i data-lucide="x"></i>
            </button>
          </div>
          <div style="padding: 20px;">
            <div style="margin-bottom: 20px;">
              <label class="form-label">Seleccionar Rol *</label>
              <select id="selectRol" class="input" required>
                <option value="">Seleccionar rol...</option>
                ${roles.map(r => `<option value="${r.id_aut_rol}">${r.aut_nombre_rol}</option>`).join('')}
              </select>
            </div>
            
            <div id="permisosContainer" style="display: none;">
              <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">Permisos Disponibles</h3>
              <div style="max-height: 400px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
                ${permisos.map(p => `
                  <label style="display: flex; align-items: start; gap: 12px; padding: 12px; border-bottom: 1px solid #f3f4f6; cursor: pointer;">
                    <input type="checkbox" value="${p.id_aut_permiso}" class="permiso-checkbox" style="margin-top: 4px;">
                    <div style="flex: 1;">
                      <div style="font-weight: 500;">${(p.aut_pantalla || "").replace(/\//g, " › ")}</div>
                      <div style="font-size: 14px; color: #6b7280;">${p.aut_descripcion || p.aut_codigo_permiso || "-"}</div>
                    </div>
                  </label>
                `).join('')}
              </div>
            </div>
            
            <div style="margin-top: 20px; display: flex; gap: 12px; justify-content: flex-end;">
              <button type="button" class="btn btn-secondary" id="cancelAssignBtn">Cancelar</button>
              <button type="button" class="btn btn-primary" id="saveAssignBtn">Asignar Permisos</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
    createIcons(iconConfig);
    
    document.getElementById('closeAssignModal').onclick = closeAssignModal;
    document.getElementById('cancelAssignBtn').onclick = closeAssignModal;
    document.getElementById('saveAssignBtn').onclick = handleAssignPermisos;
    
    document.getElementById('selectRol').onchange = async (e) => {
      const rolId = e.target.value;
      const container = document.getElementById('permisosContainer');
      
      if (!rolId) {
        container.style.display = 'none';
        return;
      }
      
      container.style.display = 'block';
      
      try {
        const res = await fetch(`${API_URL}/roles/${rolId}/permisos`, {
          headers: authHeader()
        });
        
        if (res.ok) {
          const data = await res.json();
          const permisoIds = data.permisos.map(p => p.id_aut_permiso);
          
          document.querySelectorAll('.permiso-checkbox').forEach(cb => {
            cb.checked = permisoIds.includes(parseInt(cb.value));
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    
  } catch (err) {
    showToast(err.message, "error");
  }
}

function closeAssignModal() {
  const modal = document.getElementById('assignModal');
  if (modal) modal.remove();
}

async function handleAssignPermisos() {
  const rolId = document.getElementById('selectRol').value;
  
  if (!rolId) {
    showToast("Debes seleccionar un rol", "error");
    return;
  }
  
  const checkboxes = document.querySelectorAll('.permiso-checkbox:checked');
  const permisoIds = Array.from(checkboxes).map(cb => parseInt(cb.value));
  
  try {
    const res = await fetch(`${API_URL}/roles/${rolId}/permisos`, {
      method: "POST",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      body: JSON.stringify({ permisoIds })
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error al asignar permisos");
    }
    
    closeAssignModal();
    showToast("Permisos asignados correctamente");
    loadPermisos();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ========== MOBILE MENU ==========
function initMobileMenu() {
  const btn = document.getElementById("mobileMenuBtn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  btn?.addEventListener("click", () => {
    sidebar.classList.toggle("sidebar-open");
    overlay.classList.toggle("overlay-visible");
  });

  overlay?.addEventListener("click", () => {
    sidebar.classList.remove("sidebar-open");
    overlay.classList.remove("overlay-visible");
  });
}

// ========== SEARCH ==========
function setupSearch() {
  const input = document.getElementById("searchInput");
  input?.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll("#permisosTableBody tr").forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(q) ? "" : "none";
    });
  });
}

// ========== INIT ==========
document.addEventListener("DOMContentLoaded", () => {
  setupAuthUI();
  initMobileMenu();
  setupSearch();
  loadPermisos();

  const refreshBtn = document.getElementById("refreshBtn");
  const assignRoleBtn = document.getElementById("assignRoleBtn");
  const createPermisoBtn = document.getElementById("createPermisoBtn");
  
  if (refreshBtn) refreshBtn.onclick = loadPermisos;
  if (assignRoleBtn) assignRoleBtn.onclick = openAssignRoleModal;
  if (createPermisoBtn) createPermisoBtn.onclick = openCreatePermisoModal;

  createIcons(iconConfig);
});