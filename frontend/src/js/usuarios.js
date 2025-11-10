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
    UserPlus: icons.UserPlus,
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

function formatDate(dateStr) {
  if (!dateStr) return "Nunca";
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
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
        loadUsers();
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

async function fetchUsers() {
  const res = await fetch(`${API_URL}/usuarios`, {
    headers: authHeader()
  });
  if (!res.ok) throw new Error("Error al cargar usuarios");
  return res.json();
}

async function createUser(data) {
  const res = await fetch(`${API_URL}/usuarios`, {
    method: "POST",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al crear usuario");
  }
  return res.json();
}

async function updateUser(id, data) {
  const res = await fetch(`${API_URL}/usuarios/${id}`, {
    method: "PUT",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al actualizar usuario");
  }
  return res.json();
}

async function deleteUser(id) {
  const res = await fetch(`${API_URL}/usuarios/${id}`, {
    method: "DELETE",
    headers: authHeader()
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al eliminar usuario");
  }
  return res.json();
}

// ========== RENDER ==========
async function loadRolesInSelect() {
  const select = document.getElementById("userRol");
  try {
    const roles = await fetchRoles();
    select.innerHTML = '<option value="">Seleccione un rol...</option>' +
      roles.map(r => `<option value="${r.id_aut_rol}">${r.aut_nombre_rol}</option>`).join("");
  } catch (err) {
    console.error(err);
  }
}

async function loadUsers() {
  const tbody = document.getElementById("usersTableBody");
  tbody.innerHTML = '<tr><td colspan="7" class="text-center"><div class="loading"><i data-lucide="loader"></i> Cargando...</div></td></tr>';
  createIcons(iconConfig);
  
  try {
    const users = await fetchUsers();
    
    if (!users || users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay usuarios registrados</td></tr>';
      return;
    }

    tbody.innerHTML = users.map(u => `
      <tr>
        <td><strong>${u.aut_nombre_usuario}</strong></td>
        <td>${u.aut_email || "-"}</td>
        <td>${u.aut_telefono || "-"}</td>
        <td><span class="badge badge-primary">${u.rol}</span></td>
        <td><span class="badge badge-${u.aut_estado === "Activo" ? "success" : "secondary"}">${u.aut_estado}</span></td>
        <td>${formatDate(u.aut_ultimo_acceso)}</td>
        <td class="table-actions">
          <button class="btn-icon btn-edit" data-id="${u.id_aut_usuario}" title="Editar">
            <i data-lucide="edit-2"></i>
          </button>
          <button class="btn-icon btn-delete" data-id="${u.id_aut_usuario}" title="Eliminar">
            <i data-lucide="trash-2"></i>
          </button>
        </td>
      </tr>
    `).join("");

    createIcons(iconConfig);
    attachRowActions();
  } catch (err) {
    console.error("Error al cargar usuarios:", err);
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-error">Error: ${err.message}</td></tr>`;
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
  const modal = document.getElementById("userModal");
  const title = document.getElementById("userModalTitle");
  const form = document.getElementById("userForm");
  
  title.textContent = "Crear Usuario";
  form.reset();
  document.getElementById("userId").value = "";
  document.getElementById("userPassword").required = true;
  document.getElementById("userUsername").readOnly = false;
  modal.style.display = "flex";
  createIcons(iconConfig);
}

async function openEditModal(id) {
  const modal = document.getElementById("userModal");
  const title = document.getElementById("userModalTitle");
  
  const users = await fetchUsers();
  const user = users.find(u => u.id_aut_usuario == id);
  
  if (!user) {
    showToast("Usuario no encontrado", "error");
    return;
  }

  title.textContent = "Editar Usuario";
  document.getElementById("userId").value = user.id_aut_usuario;
  document.getElementById("userUsername").value = user.aut_nombre_usuario;
  document.getElementById("userUsername").readOnly = true;
  document.getElementById("userEmail").value = user.aut_email || "";
  document.getElementById("userTelefono").value = user.aut_telefono || "";
  document.getElementById("userEstado").value = user.aut_estado || "Activo";
  document.getElementById("userPassword").value = "";
  document.getElementById("userPassword").required = false;
  
  const roles = await fetchRoles();
  const roleMatch = roles.find(r => r.aut_nombre_rol === user.rol);
  if (roleMatch) {
    document.getElementById("userRol").value = roleMatch.id_aut_rol;
  }

  modal.style.display = "flex";
  createIcons(iconConfig);
}

function closeModal() {
  document.getElementById("userModal").style.display = "none";
  document.getElementById("userForm").reset();
  document.getElementById("userUsername").readOnly = false;
}

// ========== FORM SUBMIT ==========
async function handleSubmit(e) {
  e.preventDefault();
  
  const id = document.getElementById("userId").value;
  const username = document.getElementById("userUsername").value.trim();
  const password = document.getElementById("userPassword").value.trim();
  const email = document.getElementById("userEmail").value.trim();
  const telefono = document.getElementById("userTelefono").value.trim();
  const rolId = document.getElementById("userRol").value;
  const estado = document.getElementById("userEstado").value;

  if (!username || !email || !rolId) {
    showToast("Complete los campos obligatorios", "error");
    return;
  }

  try {
    if (id) {
      const data = { email, telefono, estado, rolId };
      if (password) data.password = password;
      await updateUser(id, data);
      showToast("Usuario actualizado correctamente");
    } else {
      if (!password || password.length < 6) {
        showToast("La contraseña debe tener al menos 6 caracteres", "error");
        return;
      }
      await createUser({ username, password, email, telefono, rolId });
      showToast("Usuario creado correctamente");
    }
    
    closeModal();
    loadUsers();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function handleDelete(id) {
  if (!confirm("¿Está seguro de eliminar este usuario?")) return;
  
  try {
    await deleteUser(id);
    showToast("Usuario eliminado correctamente");
    loadUsers();
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

function highlightActive() {
  document.querySelectorAll(".sidebar-nav-item").forEach(a => {
    a.classList.remove("sidebar-nav-item-active");
    a.classList.remove("active");
  });
  
  const currentPath = window.location.pathname;
  document.querySelectorAll(".sidebar-nav-item").forEach(a => {
    const href = a.getAttribute("href");
    if (href && (href === currentPath || (currentPath.includes("usuarios") && href === "/usuarios"))) {
      a.classList.add("active");
    }
  });
}

// ========== SEARCH ==========
function setupSearch() {
  const input = document.getElementById("searchInput");
  input?.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll("#usersTableBody tr").forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(q) ? "" : "none";
    });
  });
}

// ========== INIT ==========
document.addEventListener("DOMContentLoaded", () => {
  highlightActive();
  setupAuthUI();
  initMobileMenu();
  setupSearch();
  loadRolesInSelect();
  loadUsers();

  document.getElementById("createUserBtn").onclick = openCreateModal;
  document.getElementById("refreshBtn").onclick = loadUsers;
  document.getElementById("closeUserModal").onclick = closeModal;
  document.getElementById("cancelUserForm").onclick = closeModal;
  document.getElementById("userForm").onsubmit = handleSubmit;

  createIcons(iconConfig);
});