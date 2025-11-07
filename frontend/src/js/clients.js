import { createIcons, icons } from "lucide";
import { login, logout, isLoggedIn, getUser } from "@/js/auth.js";

function highlightActive() {
  const currentPath = window.location.pathname;
  document.querySelectorAll(".sidebar-nav-item").forEach((a) => {
    const href = a.getAttribute("href");
    a.classList.toggle(
      "sidebar-nav-item-active",
      href === currentPath ||
        (currentPath === "/clients.html" && href === "/clients")
    );
  });
}

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
  },
});

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
    const u = getUser(); // {username, roleName, ...}
    if (authItem) {
      authItem.querySelector("span").textContent = "Cerrar sesión";
      authItem.querySelector("i").setAttribute("data-lucide","log-out");
      authItem.onclick = (e)=>{ e.preventDefault(); logout(); };
    }
    if (avatar) avatar.textContent = initials(u?.username || "Usuario");
    if (nameSpan) nameSpan.textContent = u?.username || "Usuario";
  } else {
    if (authItem) {
      authItem.querySelector("span").textContent = "Iniciar sesión";
      authItem.querySelector("i").setAttribute("data-lucide","log-in");
      authItem.onclick = (e)=>{ e.preventDefault(); openLoginModal(); };
    }
    if (avatar) avatar.textContent = "IN";
    if (nameSpan) nameSpan.textContent = "Invitado";
  }
  // re-render icons si cambiaron
  try { window.lucide?.createIcons(); } catch {}
}

function openLoginModal() {
  const modal = document.getElementById("loginModal");
  if (!modal) return;
  modal.style.display = "flex";
  document.getElementById("loginCancel").onclick = ()=> modal.style.display = "none";
  document.getElementById("loginForm").onsubmit = async (e)=>{
    e.preventDefault();
    const u = document.getElementById("loginUser").value.trim();
    const p = document.getElementById("loginPass").value.trim();
    try {
      await login(u,p);
      modal.style.display = "none";
      setupAuthUI();
      // opcional: toast
      console.log("Login OK");
    } catch (err) {
      alert(err.message || "Error de login");
    }
  };
}

highlightActive();
initMobileMenu();
setupAuthUI();

function initDashboard() {
  highlightActive();
  initMobileMenu();
}

document.addEventListener("DOMContentLoaded", initDashboard);
