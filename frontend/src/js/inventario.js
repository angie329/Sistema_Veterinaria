import { createIcons, icons } from "lucide";

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

/* Codigo especifico del modulo */

// Variables de estado para la paginación
let currentFilter = "";
let currentPage = 1;
let totalPages = 1;

// Elementos estáticos del DOM
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");
const paginacionIndexesContainer = document.getElementById("paginacion-indexes"); // This will hold dynamic numeric buttons
const prevButton = document.getElementById("previous");
const nextButton = document.getElementById("next");
const pageInput = document.getElementById("pageInput");
const productsTableBody = document.getElementById("productsTableBody");

function setupEventListeners() {
    // Tab Navigation
    tabButtons.forEach((button) => {
        console.log("added event listener");
        button.addEventListener("click", () => {
            /* data-tab es un atributo que tiene el nombre de el boton (producto, ingresos, salidas)
             *             coincidentemente tambien es el id de la tabla correspondiende */
            const tabName = button.getAttribute("data-tab")

            switchTab(tabName)
        })
    })
}

function switchTab(tabName) {
    /* Esta funcion le quita el estilo activo (marcado de verde), y oculta todas las tablas */
    tabButtons.forEach((btn) => btn.classList.remove("active"))
    tabContents.forEach((content) => content.classList.remove("active"))

    /* Buscar los botones que tienen el nombre pasado por event listener */
    const activeButton = document.querySelector(`[data-tab="${tabName}"]`)
    const activeContent = document.getElementById(tabName)

    if (activeButton) activeButton.classList.add("active");
    if (activeContent) activeContent.classList.add("active");

}

// Attach event listeners to static pagination controls once
function setupPaginationControls() {
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                renderProducts(currentFilter, currentPage - 1, 10);
            }
        });
    }
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                renderProducts(currentFilter, currentPage + 1, 10);
            }
        });
    }

    if (pageInput) { // pageInput is now a static element in HTML
        // 1. Limpiar caracteres no numéricos mientras se escribe
        pageInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });

        // 2. Navegar a la página al presionar "Enter"
        pageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const page = parseInt(e.target.value, 10);
                if (!isNaN(page) && page > 0 && page <= totalPages) {
                    renderProducts(currentFilter, page, 10);
                } else {
                    console.warn(`Página inválida: ${e.target.value}`);
                    alert(`Por favor, introduce un número de página válido entre 1 y ${totalPages}.`);
                }
            }
        });
    }
}

async function renderProducts(filter = "", page = 1, limit = 10) {
    // 1. Obtener productos desde el servidor
    const res = await fetch(`/v1/products?search=${encodeURIComponent(filter)}&page=${page}&limit=${limit}`);
    const data = await res.json(); // { products, totalPages, currentPage }

    // Actualizar el estado de paginación del módulo
    totalPages = data.totalPages;
    currentPage = data.currentPage;

    // 2. Renderizar resultados
    let products = data.products;
    if (!productsTableBody) {
        console.error("Element with id 'productsTableBody' not found.");
        return;
    }
    if (products.length === 0) {
        productsTableBody.innerHTML = `<tr><td colspan="10" style="text-align: center;">No se encontraron productos.</td></tr>`;
        return;
    }
    productsTableBody.innerHTML = data.products.map((product) => `
        <tr>
        <td><strong>${product.id}</strong></td>
        <td>${product.name}</td>
        <td>${product.type}</td>
        <td>${product.unit}</td>
        <td>${product.cantUnidadMedida}</td>
        <td>${product.iva}</td>
        <td>$${product.price.toFixed(2)}</td>
        <td>
        <span class="badge-status ${product.stock < 20 ? "badge-warning" : "badge-success"}">
        ${product.stock}
        </span>
        </td>
        <td>${product.category}</td>
        <td>
        <div class="table-actions">
        <button class="btn btn-sm btn-secondary">
        ✏️
        </button>
        <button class="btn btn-sm btn-danger">
        🗑️
        </button>
        </div>
        </td>
        </tr>
        `).join("");

    // 3. Actualizar la interfaz de usuario de la paginación
    updatePaginationUI(data.totalPages, data.currentPage);
}

function updatePaginationUI(totalPages, currentPage) {

    if (!paginacionIndexesContainer || !prevButton || !nextButton || !pageInput) {
        console.error("Pagination UI elements not found for update.");
        return;
    }

    // Clear existing numeric buttons
    paginacionIndexesContainer.innerHTML = '';

    // Helper to create and append a numeric button
    const appendNumericButton = (pageNumber) => {
        const button = document.createElement('button');
        button.className = `paginacion-boton indice ${pageNumber === currentPage ? 'active' : ''}`;
        button.dataset.page = pageNumber;
        button.textContent = pageNumber;
        // Adjuntar event listener aquí, ya que estos botones se recrean
        button.addEventListener('click', () => renderProducts(currentFilter, pageNumber));
        paginacionIndexesContainer.appendChild(button);
    };

    // Helper to append ellipsis
    const appendEllipsis = () => {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        ellipsis.className = 'paginacion-ellipsis'; // Add a class for styling if needed
        paginacionIndexesContainer.appendChild(ellipsis);
    };

    if (totalPages <= 0) {
        // No hay páginas para mostrar
    } else if (totalPages <= 3) { // If few pages, show all
        for (let i = 1; i <= totalPages; i++) {
            appendNumericButton(i);
        }
    } else { // Many pages, use ellipsis
        const pagesToShowAroundCurrent = 1; // e.g., current-2, current-1, current, current+1, current+2

        // Always show page 1
        appendNumericButton(1);

        // Show ellipsis if current page is far from 1
        if (currentPage > pagesToShowAroundCurrent + 1) { // e.g., if current > 4
            appendEllipsis();
        }

        // Show pages around current
        for (let i = Math.max(2, currentPage - pagesToShowAroundCurrent);
            i <= Math.min(totalPages - 1, currentPage + pagesToShowAroundCurrent);
            i++) {
            appendNumericButton(i);
        }

        // Show ellipsis if current page is far from totalPages
        if (currentPage < totalPages - pagesToShowAroundCurrent - 1) { // e.g., if current < total-3
            appendEllipsis();
        }

        // Always show last page
        appendNumericButton(totalPages);
    }

    // Update previous/next button states
    prevButton.disabled = currentPage === 1;
    if (currentPage === 1) {
        prevButton.classList.add("disabled");
    } else {
        prevButton.classList.remove("disabled");
    }
    if (currentPage === totalPages) {
        nextButton.classList.add("disabled");
    } else {
        nextButton.classList.remove("disabled");
        
        
    }
    nextButton.disabled = currentPage === totalPages;

    // Update page input value
    pageInput.value = "...";
}


function initDashboard() {
    highlightActive();
    initMobileMenu();
    setupEventListeners();
    setupPaginationControls(); // Configurar los listeners de eventos de paginación estáticos una vez
    renderProducts(); // Carga inicial.
}

document.addEventListener("DOMContentLoaded", initDashboard);
