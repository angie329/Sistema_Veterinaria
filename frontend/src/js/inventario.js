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

// // Tab Elements
// Seleccionamos los botones (producto, ingresos, salidas)
const tabButtons = document.querySelectorAll(".tab-btn")
// Seleccionamos las tablas
const tabContents = document.querySelectorAll(".tab-content")
// // Table Bodies
const productsTableBody = document.getElementById("productsTableBody")

function setupEventListeners() {
    // Tab Navigation
    tabButtons.forEach((button) => {
        console.log("added event listener");
        button.addEventListener("click", () => {

            /* data-tab es un atributo que tiene el nombre de el boton (producto, ingresos, salidas)
             *             coincidentemente tambien es el id de la tabla correspondiende */
            const tabName = button.getAttribute("data-tab")

            console.log(button.getAttribute("class"));

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


async function renderProducts(filter = "") {
    // 1. Obtener productos desde el servidor
    const res = await fetch(`/api/inventario?search=${encodeURIComponent(filter)}`);
    const products = await res.json();

    // 2. Renderizar resultados
    productsTableBody.innerHTML = products.map((product) => `
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
        <button class="btn btn-sm btn-secondary" onclick="#TODO">
        ✏️
        </button>
        <button class="btn btn-sm btn-danger" onclick="#TODO">
        🗑️
        </button>
        </div>
        </td>
        </tr>
        `).join("");
}


function initDashboard() {
    highlightActive();
    initMobileMenu();
    setupEventListeners();

}

document.addEventListener("DOMContentLoaded", initDashboard);
