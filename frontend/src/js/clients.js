import { createIcons, icons } from "lucide";
import { login, logout, isLoggedIn, getUser } from "@/js/auth.js";

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
    Menu: icons.Menu,
    X: icons.X,
    UserCog: icons.UserCog,
    Shield: icons.Shield,
    Key: icons.Key,
    FileText: icons.FileText,
    LogIn: icons.LogIn,
    LogOut: icons.LogOut,
    PlusCircle: icons.PlusCircle,
  },
};

function initials(name) {
  if (!name) return "??";
  return name.split(" ").map(s=>s[0]).join("").slice(0,2).toUpperCase();
}

function setupAuthUI() {
  const authItem = document.getElementById("sidebarAuthItem");
  const userBtn  = document.getElementById("userMenuBtn");
  const avatar   = userBtn?.querySelector(".header-avatar");
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
    cancelBtn.onclick = () => modal.style.display = "none";
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
      } catch (err) {
        alert(err.message || "Error de login");
      }
    };
  }
}

function initMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");

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

function highlightActive() {
  // Primero remueve todas las clases active
  document.querySelectorAll(".sidebar-nav-item").forEach((a) => {
    a.classList.remove("active");
    a.classList.remove("sidebar-nav-item-active");
  });
  
  // Luego agrega solo al correcto
  const currentPath = window.location.pathname;
  document.querySelectorAll(".sidebar-nav-item").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === currentPath || (currentPath.includes("clients") && href === "/clients")) {
      a.classList.add("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  highlightActive();
  setupAuthUI();
  initMobileMenu();
  createIcons(iconConfig);
});