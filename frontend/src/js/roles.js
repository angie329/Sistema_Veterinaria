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
        loadRoles();
      } catch (err) {
        showToast(err.message || "Error de login", "error");
      }
    };
  }
}

// ========== API CALLS ==========
async function fetchRoles() {
  const res = await fetch(`${API_URL}/roles`, {
    headers: authHeader()
  });
  if (!res.ok) throw new Error("Error al cargar roles");
  return res.json();
}

async function createRole(data) {
  const res = await fetch(`${API_URL}/roles`, {
    method: "POST",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al crear rol");
  }
  return res.json();
}

async function updateRole(id, data) {
  const res = await fetch(`${API_URL}/roles/${id}`, {
    method: "PUT",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al actualizar rol");
  }
  return res.json();
}

async function deleteRole(id) {
  const res = await fetch(`${API_URL}/roles/${id}`, {
    method: "DELETE",
    headers: authHeader()
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al eliminar rol");
  }
  return res.json();
}

// ========== RENDER ==========
async function loadRoles() {
  const tbody = document.getElementById("rolesTableBody");
  tbody.innerHTML = '<tr><td colspan="5" class="text-center"><div class="loading"><i data-lucide="loader"></i> Cargando...</div></td></tr>';
  createIcons(iconConfig);
  
  try {
    const roles = await fetchRoles();
    
    if (!roles || roles.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay roles registrados</td></tr>';
      return;
    }

    tbody.innerHTML = roles.map(r => `
      <tr>
        <td><strong>${r.aut_nombre_rol}</strong></td>
        <td>${r.aut_descripcion || "-"}</td>
        <td><span class="badge badge-info">${r.permisos || 0}</span></td>
        <td><span class="badge badge-secondary">${r.usuarios || 0}</span></td>
        <td class="table-actions">
          <button class="btn-icon btn-edit" data-id="${r.id_aut_rol}" title="Editar">
            <i data-lucide="edit-2"></i>
          </button>
          <button class="btn-icon btn-delete" data-id="${r.id_aut_rol}" title="Eliminar">
            <i data-lucide="trash-2"></i>
          </button>
        </td>
      </tr>
    `).join("");

    createIcons(iconConfig);
    attachRowActions();
  } catch (err) {
    console.error("Error al cargar roles:", err);
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-error">Error: ${err.message}</td></tr>`;
  }
}

function attachRowActions() {
  document.querySelectorAll(".btn-edit").forEach(btn => {
    btn.onclick = () => openEditModal(btn.dataset.id);
  });
  document.querySelectorAll(".btn-delete").forEach(btn => {
    btn.onclick = () => handleDelete(btn.dataset.id);
  });
}

// ========== MODAL ==========
function openCreateModal() {
  const modal = document.getElementById("rolModal");
  const title = document.getElementById("rolModalTitle");
  const form = document.getElementById("rolForm");
  
  title.textContent = "Crear Rol";
  form.reset();
  document.getElementById("rolId").value = "";
  modal.style.display = "flex";
  createIcons(iconConfig);
}

async function openEditModal(id) {
  const modal = document.getElementById("rolModal");
  const title = document.getElementById("rolModalTitle");
  
  const roles = await fetchRoles();
  const role = roles.find(r => r.id_aut_rol == id);
  
  if (!role) {
    showToast("Rol no encontrado", "error");
    return;
  }

  title.textContent = "Editar Rol";
  document.getElementById("rolId").value = role.id_aut_rol;
  document.getElementById("rolNombre").value = role.aut_nombre_rol;
  document.getElementById("rolDescripcion").value = role.aut_descripcion_rol || "";

  modal.style.display = "flex";
  createIcons(iconConfig);
}

function closeModal() {
  document.getElementById("rolModal").style.display = "none";
  document.getElementById("rolForm").reset();
}

// ========== FORM SUBMIT ==========
async function handleSubmit(e) {
  e.preventDefault();
  
  const id = document.getElementById("rolId").value;
  const nombre = document.getElementById("rolNombre").value.trim();
  const descripcion = document.getElementById("rolDescripcion").value.trim();

  if (!nombre) {
    showToast("El nombre del rol es obligatorio", "error");
    return;
  }

  try {
    if (id) {
      await updateRole(id, { nombre, descripcion });
      showToast("Rol actualizado correctamente");
    } else {
      await createRole({ nombre, descripcion });
      showToast("Rol creado correctamente");
    }
    
    closeModal();
    loadRoles();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function handleDelete(id) {
  if (!confirm("¿Está seguro de eliminar este rol?")) return;
  
  try {
    await deleteRole(id);
    showToast("Rol eliminado correctamente");
    loadRoles();
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
    document.querySelectorAll("#rolesTableBody tr").forEach(row => {
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
  loadRoles();

  document.getElementById("createRolBtn").onclick = openCreateModal;
  document.getElementById("refreshBtn").onclick = loadRoles;
  document.getElementById("closeRolModal").onclick = closeModal;
  document.getElementById("cancelRolForm").onclick = closeModal;
  document.getElementById("rolForm").onsubmit = handleSubmit;

  createIcons(iconConfig);
});