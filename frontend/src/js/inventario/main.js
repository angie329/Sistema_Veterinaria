import { createIcons, icons } from "lucide";
import { productsRender, setupProductEventListeners } from './products.js';
import { movementsRender, setupMovementEventListeners } from './movements.js';
import { incomesRender, setupIncomeEventListeners } from './ingresos.js';
import * as DOM from './domElements.js';
import { salidasRender, setupSalidaEventListeners } from './salidas.js';
import { setupTabNavigation, setupPaginationControls } from './ui.js';

// resalta el enlace activo en la barra lateral.
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

// inicializa los iconos de lucide que se usan en la pagina.
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

// configura la funcionalidad del menu para dispositivos moviles.
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const sidebar = document.getElementById("sidebar");
    const overlay =
        document.getElementById("sidebarOverlay") ||
        document.querySelector(".sidebar-overlay");

    // abre y cierra la barra lateral al hacer clic en el boton del menu.
    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener("click", () => {
            sidebar.classList.toggle("sidebar-open");
            if (overlay) {
                overlay.classList.toggle("overlay-visible");
            }
        });
    }

    // cierra la barra lateral al hacer clic en la superposicion oscura.
    if (overlay) {
        overlay.addEventListener("click", () => {
            sidebar.classList.remove("sidebar-open");
            overlay.classList.remove("overlay-visible");
        });
    }

    // asegura que la barra lateral y la superposicion se oculten en pantallas mas grandes.
    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove("sidebar-open");
            if (overlay) {
                overlay.classList.remove("overlay-visible");
            }
        }
    });
}


// estado de la aplicacion para el modulo de inventario.
// usamos un objeto para mantener el estado agrupado y evitar variables globales sueltas.
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


// configura el boton de exportar para abrir el modal correspondiente.
function setupExportModal(exportBtn, dataType) {
    if (!exportBtn) return;

    const exportModal = document.getElementById('exportModal');

    // al hacer clic, muestra el modal y guarda el tipo de dato a exportar.
    exportBtn.addEventListener('click', () => {
        DOM.exportModalOverlay.style.display = 'flex';
        // guardamos el tipo de dato en el modal para saber que exportar.
        exportModal.dataset.exportType = dataType;
    });
}

// inicializa los listeners dentro del modal de exportacion.
function initExportListeners() {
    const exportModal = document.getElementById('exportModal');

    // listener para los botones de formato (pdf, excel, etc.).
    exportModal.addEventListener('click', (e) => {
        const formatBtn = e.target.closest('.btn-export');
        if (!formatBtn) return;

        const format = formatBtn.dataset.format;
        const dataType = exportModal.dataset.exportType;

        if (dataType && format) {
            // construimos la url y abrimos en una nueva pestaña para iniciar la descarga.
            const url = `/v1/invexports/${dataType}${format}`;
            window.open(url, '_blank');
            closeExportModal();
        }
    });

    // listeners para los botones de cerrar y cancelar, y para el overlay.
    DOM.closeExportModalBtn.addEventListener('click', closeExportModal);
    DOM.cancelExportModalBtn.addEventListener('click', closeExportModal);
    DOM.exportModalOverlay.addEventListener('click', (e) => {
        if (e.target === DOM.exportModalOverlay) closeExportModal();
    });
}

// configura los manejadores de busqueda para todas las pestañas.
function setupSearchHandlers() {
    const searchConfigs = [
        { input: DOM.productSearchInput, button: DOM.productSearchBtn, renderFn: productsRender },
        { input: DOM.movementSearchInput, button: DOM.movementSearchBtn, renderFn: movementsRender },
        { input: DOM.incomeSearchInput, button: DOM.incomeSearchBtn, renderFn: incomesRender },
        { input: DOM.outputSearchInput, button: DOM.outputSearchBtn, renderFn: salidasRender },
    ];

    // itera sobre la configuracion de cada pestaña.
    searchConfigs.forEach(({ input, button, renderFn }) => {
        if (!input || !button) return;

        // funcion que ejecuta la busqueda.
        const performSearch = () => {
            const searchTerm = input.value;
            // actualiza el filtro en el estado global.
            state.currentFilter = searchTerm;
            // llama a la funcion de renderizado con el filtro y resetea a la pagina 1.
            renderFn(searchTerm, 1);
        };

        // asigna la funcion de busqueda al boton y a la tecla 'enter'.
        button.addEventListener('click', performSearch);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        // opcional: limpia la busqueda si el input se vacia.
        input.addEventListener('input', () => {
            if (input.value === '') {
                performSearch();
            }
        });
    });
}

// funcion principal que inicializa todo el modulo de inventario.
function initInventoryModule() {
    // 1. inicializa componentes de ui compartidos.
    highlightActive();
    initMobileMenu();

    // 2. configura manejadores de eventos para pestañas, formularios y paginacion.
    setupTabNavigation();
    setupProductEventListeners();
    setupMovementEventListeners();
    setupIncomeEventListeners();
    setupSalidaEventListeners();
    setupSearchHandlers();
    setupPaginationControls();

    // 3. configura los modales de exportacion para cada tipo de dato.
    setupExportModal(DOM.exportProductBtn, 'products');
    setupExportModal(DOM.exportIncomeBtn, 'income');
    setupExportModal(DOM.exportOutputBtn, 'salidas');
    setupExportModal(DOM.exportMovementBtn, 'movements');
    initExportListeners();

    // 4. carga inicial de datos (la pestaña de productos es la activa por defecto).
    productsRender();
}

// cierra el modal de exportacion.
function closeExportModal() {
    if (DOM.exportModalOverlay) {
        DOM.exportModalOverlay.style.display = 'none';
    }
}

// inicia todo cuando el dom este listo.
document.addEventListener("DOMContentLoaded", initInventoryModule);