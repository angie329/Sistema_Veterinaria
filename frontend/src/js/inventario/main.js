import { createIcons, icons } from "lucide";
import { productsRender, setupProductEventListeners } from './products.js';
import { movementsRender, setupMovementEventListeners } from './movements.js';
import { incomesRender, setupIncomeEventListeners } from './ingresos.js';
import * as DOM from './domElements.js';
import { salidasRender, setupSalidaEventListeners } from './salidas.js';
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
 * Estado de la aplicación para el módulo de inventario
 * Usamos un objeto para mantener el estado agrupado y evitar variables globales sueltas
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

};


function setupExportModal(exportBtn, dataType) {
    if (!exportBtn) return;

    const exportModal = document.getElementById('exportModal');

    exportBtn.addEventListener('click', () => {
        DOM.exportModalOverlay.style.display = 'flex';
        // Guardamos el tipo de dato en el modal para saber qué exportar
        exportModal.dataset.exportType = dataType;
    });
}

function initExportListeners() {
    const exportModal = document.getElementById('exportModal');

    // Listener para los botones de formato dentro del modal
    exportModal.addEventListener('click', (e) => {
        const formatBtn = e.target.closest('.btn-export');
        if (!formatBtn) return;

        const format = formatBtn.dataset.format;
        const dataType = exportModal.dataset.exportType;

        if (dataType && format) {
            // Construimos la URL y abrimos en una nueva pestaña
            const url = `/v1/invexports/${dataType}${format}`;
            window.open(url, '_blank');
            closeExportModal();
        }
    });

    // Listeners para cerrar el modal
    DOM.closeExportModalBtn.addEventListener('click', closeExportModal);
    DOM.cancelExportModalBtn.addEventListener('click', closeExportModal);
    DOM.exportModalOverlay.addEventListener('click', (e) => {
        if (e.target === DOM.exportModalOverlay) closeExportModal();
    });
}

function setupSearchHandlers() {
    const searchConfigs = [
        { input: DOM.productSearchInput, button: DOM.productSearchBtn, renderFn: productsRender },
        { input: DOM.movementSearchInput, button: DOM.movementSearchBtn, renderFn: movementsRender },
        { input: DOM.incomeSearchInput, button: DOM.incomeSearchBtn, renderFn: incomesRender },
        { input: DOM.outputSearchInput, button: DOM.outputSearchBtn, renderFn: salidasRender },
    ];

    searchConfigs.forEach(({ input, button, renderFn }) => {
        if (!input || !button) return;

        const performSearch = () => {
            const searchTerm = input.value;
            // Aquí podrías usar un filtro por tab si lo necesitaras en el futuro
            // Por ahora, usamos el filtro global como está diseñado
            state.currentFilter = searchTerm;
            renderFn(searchTerm, 1); // Llama a la función de renderizado con el filtro y resetea a la página 1
        };

        button.addEventListener('click', performSearch);

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        // Opcional: Limpiar la búsqueda si el input se vacía
        input.addEventListener('input', () => {
            if (input.value === '') {
                performSearch();
            }
        });
    });
}

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
    setupSearchHandlers();
    setupPaginationControls();

    // 3. Configurar modales de exportación
    setupExportModal(DOM.exportProductBtn, 'products');
    setupExportModal(DOM.exportIncomeBtn, 'income');
    setupExportModal(DOM.exportOutputBtn, 'salidas');
    setupExportModal(DOM.exportMovementBtn, 'movements');
    initExportListeners();

    // 3. Carga inicial de datos (la pestaña de productos es la activa por defecto)
    productsRender();
}

function closeExportModal() {
    if (DOM.exportModalOverlay) {
        DOM.exportModalOverlay.style.display = 'none';
    }
}

// Iniciar todo cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", initInventoryModule);