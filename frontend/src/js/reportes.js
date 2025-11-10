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
    Download: icons.Download,
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
        loadReport();
      } catch (err) {
        showToast(err.message || "Error de login", "error");
      }
    };
  }
}

// ========== API CALLS ==========
async function fetchReport(rolId = "", estado = "") {
  let url = `${API_URL}/report/usuarios-por-rol`;
  const params = new URLSearchParams();
  if (rolId) params.append("rolId", rolId);
  if (estado) params.append("estado", estado);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  const res = await fetch(url, {
    headers: authHeader()
  });
  if (!res.ok) throw new Error("Error al cargar reporte");
  return res.json();
}

async function fetchRoles() {
  const res = await fetch(`${API_URL}/roles`, {
    headers: authHeader()
  });
  if (!res.ok) throw new Error("Error al cargar roles");
  return res.json();
}

// ========== RENDER ==========
let reportData = [];

async function loadRolesFilter() {
  const select = document.getElementById("filterRol");
  if (!select) return;
  
  try {
    const roles = await fetchRoles();
    select.innerHTML = '<option value="">Todos los roles</option>' +
      roles.map(r => `<option value="${r.id_aut_rol}">${r.aut_nombre_rol}</option>`).join("");
  } catch (err) {
    console.error(err);
  }
}

async function loadReport() {
  const tbody = document.getElementById("reportTableBody");
  if (!tbody) return;
  
  tbody.innerHTML = '<tr><td colspan="5" class="text-center"><div class="loading"><i data-lucide="loader"></i> Cargando reporte...</div></td></tr>';
  createIcons(iconConfig);
  
  const rolId = document.getElementById("filterRol")?.value || "";
  const estado = document.getElementById("filterEstado")?.value || "";
  
  try {
    const data = await fetchReport(rolId, estado);
    reportData = data;
    
    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay datos para mostrar con los filtros seleccionados</td></tr>';
      updateSummary([]);
      return;
    }

    tbody.innerHTML = data.map(u => `
      <tr>
        <td><strong>${u.usuario || "Sin nombre"}</strong></td>
        <td>${u.email || "-"}</td>
        <td><span class="badge badge-primary">${u.rol || "Sin rol"}</span></td>
        <td><span class="badge badge-${u.estado === "Activo" ? "success" : "secondary"}">${u.estado || "Inactivo"}</span></td>
        <td>${formatDate(u.ultimo_acceso)}</td>
      </tr>
    `).join("");

    createIcons(iconConfig);
    updateSummary(data);
  } catch (err) {
    console.error("Error al cargar reporte:", err);
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-error">Error: ${err.message}</td></tr>`;
    updateSummary([]);
  }
}

function updateSummary(data) {
  const total = data.length;
  const activos = data.filter(u => u.estado === "Activo").length;
  const inactivos = total - activos;
  
  const totalEl = document.getElementById("totalUsuarios");
  const activosEl = document.getElementById("usuariosActivos");
  const inactivosEl = document.getElementById("usuariosInactivos");
  
  if (totalEl) totalEl.textContent = total;
  if (activosEl) activosEl.textContent = activos;
  if (inactivosEl) inactivosEl.textContent = inactivos;
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

// ========== INIT ==========
document.addEventListener("DOMContentLoaded", () => {
  setupAuthUI();
  initMobileMenu();
  loadRolesFilter();
  loadReport();

  const applyBtn = document.getElementById("applyFiltersBtn");
  const refreshBtn = document.getElementById("refreshReportBtn");
  const exportBtn = document.getElementById("exportBtn");  // AGREGAR ESTO
  
  if (applyBtn) applyBtn.onclick = loadReport;
  if (refreshBtn) refreshBtn.onclick = loadReport;
  
  // AGREGAR ESTA FUNCIÓN PARA EXPORTAR
  if (exportBtn) {
    exportBtn.onclick = () => {
      if (reportData.length === 0) {
        alert("No hay datos para exportar");
        return;
      }
      
      // Exportar como CSV
      const headers = ["Usuario", "Email", "Rol", "Estado", "Último Acceso"];
      const rows = reportData.map(u => [
        u.usuario || "",
        u.email || "",
        u.rol || "",
        u.estado || "",
        formatDate(u.ultimo_acceso)
      ]);
      
      let csv = headers.join(",") + "\n";
      rows.forEach(row => {
        csv += row.map(cell => `"${cell}"`).join(",") + "\n";
      });
      
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte_usuarios_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert("Reporte exportado correctamente");
    };
  }

  createIcons(iconConfig);
});