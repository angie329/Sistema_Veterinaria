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

// código específico del módulo

// estado de la paginación
let currentFilter = "";
let currentPage = 1;
let totalPages = 1;

// elementos del dom
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");
const paginacionIndexesContainer = document.getElementById("paginacion-indexes"); // contenedor para los botones numéricos de página
const prevButton = document.getElementById("previous");
const nextButton = document.getElementById("next");
const pageInput = document.getElementById("pageInput");
const productsTableBody = document.getElementById("productsTableBody");
const addProductBtn = document.getElementById("addProductBtn");
const productModalOverlay = document.getElementById("productModalOverlay");
const productForm = document.getElementById("productForm");
const closeModalBtn = document.getElementById("closeModalBtn");
const productIdInput = document.getElementById('productId');

const cancelModalBtn = document.getElementById("cancelModalBtn");


function setupEventListeners() {
    // navegación por pestañas
    tabButtons.forEach((button) => {
        console.log("added event listener");
        button.addEventListener("click", () => {
            // data-tab tiene el nombre de la pestaña y el id de su contenido
            const tabName = button.getAttribute("data-tab")

            switchTab(tabName)
        })
    })

    // listeners del modal
    addProductBtn.addEventListener('click', openProductModal);
    closeModalBtn.addEventListener('click', closeProductModal);
    cancelModalBtn.addEventListener('click', closeProductModal);
    productModalOverlay.addEventListener('click', (e) => {
        if (e.target === productModalOverlay) {
            closeProductModal();
        }
    });

    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveProduct();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && productModalOverlay.style.display !== 'none') {
            closeProductModal();
        }
    });

    // delegación de eventos para la tabla (editar/borrar)
    productsTableBody.addEventListener('click', (e) => {
        const editButton = e.target.closest('.btn-edit');
        if (editButton) {
            const productId = editButton.dataset.id;
            openProductModalForEdit(productId);
        }

        const toggleButton = e.target.closest('.btn-toggle-status');
        if (toggleButton) {
            const productId = toggleButton.dataset.id;
            toggleProductStatus(productId);
        }
    });
}

function switchTab(tabName) {
    // quita la clase 'active' de todas las pestañas y contenidos
    tabButtons.forEach((btn) => btn.classList.remove("active"))
    tabContents.forEach((content) => content.classList.remove("active"))

    // activa la pestaña y el contenido seleccionados
    const activeButton = document.querySelector(`[data-tab="${tabName}"]`)
    const activeContent = document.getElementById(tabName)

    if (activeButton) activeButton.classList.add("active");
    if (activeContent) activeContent.classList.add("active");

}

// configura los listeners de la paginación una vez
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

    if (pageInput) { // el input de página es un elemento estático
        // 1. limpiar caracteres no numéricos mientras se escribe
        pageInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });

        // 2. navegar a la página al presionar "enter"
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
    // 1. obtener productos desde el servidor
    const res = await fetch(`/v1/products?search=${encodeURIComponent(filter)}&page=${page}&limit=${limit}`);
    const data = await res.json(); // { products, totalPages, currentPage }
    console.log("Products data:", data);
    if (!data.products) return; // salir si no hay productos

    // actualizar el estado de paginación del módulo
    totalPages = data.totalPages;
    currentPage = data.currentPage;

    // 2. renderizar resultados en la tabla
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
            <td><strong>${product.id_Inv_Articulo}</strong></td>
            <td>${product.Inv_Nombre}</td>
            <td>${product.TipoArticulo}</td>
            <td>${product.UnidadMedida}</td>
            <td>${product.Inv_CantUnidadMedida}</td>
            <td>${product.IVA}</td>
            <td>$${product.Inv_PrecioUnitario}</td>
            <td>
                <span class="badge-status ${product.Inv_StockActual < 20 ? "badge-warning" : "badge-success"}">
                    ${product.Inv_StockActual}
                </span>
            </td>
            <td>${product.Inv_Categoria}</td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-sm btn-secondary btn-edit" data-id="${product.id_Inv_Articulo}">✏️</button>
                    <button class="btn btn-sm btn-danger btn-toggle-status" data-id="${product.id_Inv_Articulo}">
                        🗑️
                    </button>
                </div>
            </td>
        </tr>
        `).join("");

    // 3. actualizar la interfaz de la paginación
    updatePaginationUI(data.totalPages, data.currentPage);
}

async function openProductModal() {
    productForm.reset(); // limpiar el formulario
    productIdInput.value = ''; // asegurarse que no hay id de producto
    document.getElementById('modalTitle').textContent = 'Agregar Nuevo Producto';

    // cargar opciones para los <select>
    await populateSelectOptions();

    productModalOverlay.style.display = 'flex';
}

async function openProductModalForEdit(productId) {
    productForm.reset();
    document.getElementById('modalTitle').textContent = 'Editar Producto';
    productIdInput.value = productId;

    try {
        // cargar las opciones y los datos del producto en paralelo
        const [_, productResponse] = await Promise.all([
            populateSelectOptions(),
            fetch(`/v1/products/${productId}`)
        ]);

        if (!productResponse.ok) throw new Error('No se pudo cargar la información del producto.');

        const product = await productResponse.json();

        // rellenar el formulario con los datos del producto
        for (const key in product) {
            if (productForm.elements[key]) {
                productForm.elements[key].value = product[key];
            }
        }
        productModalOverlay.style.display = 'flex';
    } catch (error) {
        console.error('Error al abrir el modal de edición:', error);
        alert(error.message);
    }
}

function closeProductModal() {
    productModalOverlay.style.display = 'none';
}

async function populateSelectOptions() {
    try {
        const res = await fetch('/v1/products/options');
        if (!res.ok) throw new Error('Failed to fetch options');
        const options = await res.json();

        const tipoSelect = document.getElementById('productType');
        const unidadSelect = document.getElementById('productUnit');
        const ivaSelect = document.getElementById('productIva');

        // función auxiliar para poblar un select
        const populate = (select, items) => {
            select.innerHTML = '<option value="">Seleccione...</option>';
            items.forEach(item => {
                select.innerHTML += `<option value="${item.id}">${item.name}</option>`;
            });
        };

        populate(tipoSelect, options.tiposArticulo);
        populate(unidadSelect, options.unidadesMedida);
        populate(ivaSelect, options.ivas);

    } catch (error) {
        console.error("Error populating select options:", error);
        alert("No se pudieron cargar las opciones para el formulario. Intente de nuevo.");
    }
}

async function saveProduct() {
    const formData = new FormData(productForm);
    const productData = Object.fromEntries(formData.entries());
    const productId = productIdInput.value;

    const isUpdating = !!productId;
    const url = isUpdating ? `/v1/products/${productId}` : '/v1/products';
    const method = isUpdating ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error al ${isUpdating ? 'actualizar' : 'guardar'} el producto`);
        }

        alert(`Producto ${isUpdating ? 'actualizado' : 'guardado'} exitosamente`);
        closeProductModal();
        // recargar la tabla para mostrar los cambios
        renderProducts(currentFilter, currentPage);
    } catch (error) {
        console.error('Failed to save product:', error);
        alert(`Error: ${error.message}`);
    }
}

async function toggleProductStatus(productId) {
    // Primero, obtenemos el estado actual del producto para personalizar el mensaje
    const productRow = document.querySelector(`button[data-id='${productId}'].btn-toggle-status`);
    const isActivating = productRow.classList.contains('btn-success'); // Si tiene btn-success, la acción es reactivar

    const actionText = isActivating ? 'reactivar' : 'desactivar';
    const confirmation = confirm(`¿Estás seguro de que deseas ${actionText} este producto?`);

    if (!confirmation) return

    try {
        const response = await fetch(`/v1/products/${productId}/toggle-status`, {
            method: 'PATCH',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error al ${actionText} el producto.`);
        }
        // Recargar la tabla para reflejar el cambio de estado
        await renderProducts(currentFilter, currentPage);
    } catch (error) {
        console.error(`Failed to ${actionText} product:`, error);
        alert(`Error: ${error.message}`);
    }
}

function updatePaginationUI(totalPages, currentPage) {

    if (!paginacionIndexesContainer || !prevButton || !nextButton || !pageInput) {
        console.error("Pagination UI elements not found for update.");
        return;
    }

    // limpiar botones numéricos existentes
    paginacionIndexesContainer.innerHTML = '';

    // función auxiliar para crear y añadir un botón numérico
    const appendNumericButton = (pageNumber) => {
        const button = document.createElement('button');
        button.className = `paginacion-boton indice ${pageNumber === currentPage ? 'active' : ''}`;
        button.dataset.page = pageNumber;
        button.textContent = pageNumber;
        // adjuntar listener aquí, ya que los botones se recrean
        button.addEventListener('click', () => renderProducts(currentFilter, pageNumber));
        paginacionIndexesContainer.appendChild(button);
    };

    // función auxiliar para añadir puntos suspensivos
    const appendEllipsis = () => {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        ellipsis.className = 'paginacion-ellipsis'; // Add a class for styling if needed
        paginacionIndexesContainer.appendChild(ellipsis);
    };

    if (totalPages <= 0) {
        // no hay páginas para mostrar
    } else if (totalPages <= 3) { // si hay pocas páginas, mostrarlas todas
        for (let i = 1; i <= totalPages; i++) {
            appendNumericButton(i);
        }
    } else { // si hay muchas páginas, usar puntos suspensivos
        const pagesToShowAroundCurrent = 1;

        // mostrar siempre la página 1
        appendNumericButton(1);

        // mostrar '...' si la página actual está lejos del inicio
        if (currentPage > pagesToShowAroundCurrent + 1) {
            appendEllipsis();
        }

        // mostrar páginas alrededor de la actual
        for (let i = Math.max(2, currentPage - pagesToShowAroundCurrent);
            i <= Math.min(totalPages - 1, currentPage + pagesToShowAroundCurrent);
            i++) {
            appendNumericButton(i);
        }

        // mostrar '...' si la página actual está lejos del final
        if (currentPage < totalPages - pagesToShowAroundCurrent - 1) {
            appendEllipsis();
        }

        // mostrar siempre la última página
        appendNumericButton(totalPages);
    }

    // actualizar estado de los botones previo/siguiente
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

    // actualizar el valor del input de página
    pageInput.value = "...";
}


function initDashboard() {
    highlightActive();
    initMobileMenu();
    setupEventListeners();
    setupPaginationControls(); // configurar listeners de paginación estáticos
    renderProducts(); // carga inicial de productos
}

document.addEventListener("DOMContentLoaded", initDashboard);
