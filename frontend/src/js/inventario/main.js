import { createIcons, icons } from "lucide";
import { productsRender, setupProductEventListeners } from './products.js';
import { setupMovementEventListeners } from './movements.js';
import { setupIncomeEventListeners } from './ingresos.js';
import { setupSalidaEventListeners } from './salidas.js';
import { setupTabNavigation, setupPaginationControls } from './ui.js';

function highlightActive() {
    const currentPath = window.location.pathname;
    document.querySelectorAll(".sidebar-nav-item").forEach((a) => {
        const href = a.getAttribute("href");
        a.classList.toggle(
            "sidebar-nav-item-active",
            href === currentPath ||
            (currentPath === "/inventario.html" && href === "/inventario")
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


/**
 * Estado de la aplicación para el módulo de inventario.
 * Usamos un objeto para mantener el estado agrupado y evitar variables globales sueltas.
 */
export const state = {
    currentFilter: "",
    products: {
        currentPage: 1,
        totalPages: 1,
    },
    movements: {
        currentPage: 1,
        totalPages: 1,
    },
    incomes:
    {
        currentPage: 1,
        totalPages: 1,
    },
    salidas:
    {
        currentPage: 1,
        totalPages: 1,
    },
    salidas:
    {
        currentPage: 1,
        totalPages: 1,
    },

};


function initInventoryModule() {
    // 1. Inicializar componentes de UI compartidos
    highlightActive();
    initMobileMenu();

    // 2. Configurar manejadores de eventos
    setupTabNavigation();
    setupProductEventListeners();
    setupMovementEventListeners();
    setupIncomeEventListeners();
    setupSalidaEventListeners();
    setupPaginationControls();

    // 3. Carga inicial de datos (la pestaña de productos es la activa por defecto)
    productsRender();
}

// Iniciar todo cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", initInventoryModule);