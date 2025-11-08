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
let productsCurrentPage = 1;
let productsTotalPages = 1;

let movementsCurrentPage = 1;
let movementsTotalPages = 1;

// elementos del dom
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

// --- Elementos de Productos ---
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

// --- Elementos de Movimientos ---
const movementsTableBody = document.getElementById("movementsTableBody");
const movementsPaginacionContainer = document.getElementById("movementsPaginacionIndexes");
const movementsPrevBtn = document.getElementById("movementsPrev");
const movementsNextBtn = document.getElementById("movementsNext");
const movementsPageInput = document.getElementById("movementsPageInput");

const addMovementBtn = document.getElementById("addMovementBtn");
// --- Elementos del Modal de Movimientos ---
const movementModalOverlay = document.getElementById("movementModalOverlay");
const movementForm = document.getElementById("movementForm");
const closeMovementModalBtn = document.getElementById("closeMovementModalBtn");
const cancelMovementModalBtn = document.getElementById("cancelMovementModalBtn");
const movementIdInput = document.getElementById('movementId');


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
    addProductBtn.addEventListener('click', productOpenModal);
    closeModalBtn.addEventListener('click', productCloseModal);
    cancelModalBtn.addEventListener('click', productCloseModal);
    productModalOverlay.addEventListener('click', (e) => {
        if (e.target === productModalOverlay) {
            productCloseModal();
        }
    });

    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await productSave();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && productModalOverlay.style.display !== 'none') {
            productCloseModal();
        }
    });

    // delegación de eventos para la tabla (editar/borrar)
    productsTableBody.addEventListener('click', (e) => {
        const editButton = e.target.closest('.btn-edit');
        if (editButton) {
            const productId = editButton.dataset.id;
            productOpenModalForEdit(productId);
        }

        const toggleButton = e.target.closest('.btn-toggle-status');
        if (toggleButton) {
            const productId = toggleButton.dataset.id;
            toggleProductStatus(productId);
        }
    });

    // Listeners para el modal de movimientos
    if (addMovementBtn) addMovementBtn.addEventListener('click', movementOpenModalForCreate);
    if (closeMovementModalBtn) closeMovementModalBtn.addEventListener('click', closeMovementModal);
    if (cancelMovementModalBtn) cancelMovementModalBtn.addEventListener('click', closeMovementModal);
    if (movementModalOverlay) {
        movementModalOverlay.addEventListener('click', (e) => {
            if (e.target === movementModalOverlay) {
                closeMovementModal();
            }
        });
    }
    if (movementForm) {
        movementForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveMovement();
        });
    }

    // Delegación de eventos para la tabla de movimientos
    movementsTableBody.addEventListener('click', (e) => {
        const editButton = e.target.closest('.btn-edit-movement');
        if (editButton) {
            const movementId = editButton.dataset.id;
            openMovementModalForEdit(movementId);
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

    // Cargar datos de la pestaña si es la primera vez que se abre
    if (tabName === 'movimientos' && movementsTableBody.childElementCount === 0) {
        movementsRender();
    }

}

// configura los listeners de la paginación una vez
function setupPaginationControls() {
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (productsCurrentPage > 1) {
                productsRender(currentFilter, productsCurrentPage - 1, 10);
            }
        });
    }
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (productsCurrentPage < productsTotalPages) {
                productsRender(currentFilter, productsCurrentPage + 1, 10);
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
                if (!isNaN(page) && page > 0 && page <= productsTotalPages) {
                    productsRender(currentFilter, page, 10);
                } else {
                    console.warn(`Página de productos inválida: ${e.target.value}`);
                    alert(`Por favor, introduce un número de página válido entre 1 y ${productsTotalPages}.`);
                }
            }
        });
    }

    // Listeners para la paginación de movimientos
    if (movementsPrevBtn) {
        movementsPrevBtn.addEventListener('click', () => {
            if (movementsCurrentPage > 1) {
                movementsRender(currentFilter, movementsCurrentPage - 1, 10);
            }
        });
    }
    if (movementsNextBtn) {
        movementsNextBtn.addEventListener('click', () => {
            if (movementsCurrentPage < movementsTotalPages) {
                movementsRender(currentFilter, movementsCurrentPage + 1, 10);
            }
        });
    }
    if (movementsPageInput) {
        movementsPageInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
        movementsPageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const page = parseInt(e.target.value, 10);
                if (!isNaN(page) && page > 0 && page <= movementsTotalPages) {
                    movementsRender(currentFilter, page, 10);
                } else {
                    alert(`Por favor, introduce un número de página válido entre 1 y ${movementsTotalPages}.`);
                }
            }
        });
    }
}

async function productsRender(filter = "", page = 1, limit = 10) {
    // 1. obtener productos desde el servidor
    const res = await fetch(`/v1/products?search=${encodeURIComponent(filter)}&page=${page}&limit=${limit}`);
    const data = await res.json(); // { products, totalPages, currentPage }
    console.log("Products data:", data);
    if (!data.products) return; // salir si no hay productos

    // actualizar el estado de paginación del módulo
    productsTotalPages = data.totalPages;
    productsCurrentPage = data.currentPage;

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
    productsUpdatePaginationUI(data.totalPages, data.currentPage);
}

async function movementsRender(filter = "", page = 1, limit = 10) {
    try {
        const res = await fetch(`/v1/movements?search=${encodeURIComponent(filter)}&page=${page}&limit=${limit}`);
        const data = await res.json(); // { movements, totalPages, currentPage }

        if (!data.movements) return;
        console.log(data);


        movementsCurrentPage = data.currentPage;
        movementsTotalPages = data.totalPages;

        if (data.movements.length === 0) {
            movementsTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No se encontraron movimientos.</td></tr>`;
            return;
        }

        movementsTableBody.innerHTML = data.movements.map(mov => `
            <tr>
                <td>${mov.Inv_Fecha}</td>
                <td>${mov.ProductoNombre}</td>
                <td>
                    <span class="badge-status ${mov.TipoMovimiento === 'Ingreso' ? 'badge-success' : 'badge-warning'}">
                        ${mov.TipoMovimiento}
                    </span>
                </td>
                <td>${mov.Inv_Cantidad}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-secondary btn-edit-movement" data-id="${mov.id_Inv_Movimiento}">✏️</button>
                        <button class="btn btn-sm btn-danger btn-delete-movement" data-id="${mov.id_Inv_Movimiento}">🗑️</button>
                    </div>
                </td>
            </tr>
        `).join("");

        movementsUpdatePaginationUI(movementsTotalPages, movementsCurrentPage);

    } catch (error) {
        console.error("Error rendering movements:", error);
        if (movementsTableBody) {
            movementsTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Error al cargar los movimientos.</td></tr>`;
        }
    }
}


async function productOpenModal() {
    productForm.reset(); // limpiar el formulario
    productIdInput.value = ''; // asegurarse que no hay id de producto
    document.getElementById('modalTitle').textContent = 'Agregar Nuevo Producto';

    // cargar opciones para los <select>
    await populateSelectOptions();

    productModalOverlay.style.display = 'flex';
}

async function productOpenModalForEdit(productId) {
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

function productCloseModal() {
    productModalOverlay.style.display = 'none';
}

async function movementOpenModalForCreate() {
    movementForm.reset();
    movementIdInput.value = '';
    document.getElementById('movementModalTitle').textContent = 'Registrar Nuevo Movimiento';

    try {
        const response = await fetch('/v1/movements/options');
        if (!response.ok) {
            throw new Error('No se pudieron cargar las opciones para el formulario.');
        }
        const options = await response.json();

        populateSelect('movementProduct', options.products);
        populateSelect('movementType', options.movementTypes);

        movementModalOverlay.style.display = 'flex';
    } catch (error) {
        console.error('Error al abrir modal para crear movimiento:', error);
        alert(error.message);
    }
}

async function openMovementModalForEdit(movementId) {
    movementForm.reset();
    movementIdInput.value = movementId;

    try {
        const response = await fetch(`/v1/movements/${movementId}`);
        if (!response.ok) {
            throw new Error('No se pudo cargar la información del movimiento.');
        }
        const { movement, options } = await response.json();
        document.getElementById('movementModalTitle').textContent = 'Editar Movimiento';

        // Poblar los selects
        populateSelect('movementProduct', options.products);
        populateSelect('movementType', options.movementTypes);

        // Rellenar el formulario
        for (const key in movement) {
            if (movementForm.elements[key]) {
                movementForm.elements[key].value = movement[key];
            }
        }

        movementModalOverlay.style.display = 'flex';

    } catch (error) {
        console.error('Error al abrir el modal de edición de movimiento:', error);
        alert(error.message);
    }
}

function closeMovementModal() {
    if (movementModalOverlay) {
        movementModalOverlay.style.display = 'none';
    }
}

async function saveMovement() {
    const formData = new FormData(movementForm);
    const movementData = Object.fromEntries(formData.entries());
    // El campo del formulario se llama 'movementId', pero en la data lo queremos como 'id'
    delete movementData.movementId;
    const movementId = movementIdInput.value;

    const isUpdating = !!movementId;
    const url = isUpdating ? `/v1/movements/${movementId}` : '/v1/movements';
    const method = isUpdating ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(movementData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error al ${isUpdating ? 'actualizar' : 'crear'} el movimiento`);
        }

        alert(`Movimiento ${isUpdating ? 'actualizado' : 'creado'} exitosamente`);
        closeMovementModal();
        // Recargar la tabla para mostrar los cambios
        movementsRender(currentFilter, movementsCurrentPage);
    } catch (error) {
        console.error('Failed to save movement:', error);
        alert(`Error: ${error.message}`);
    }
}


async function populateSelectOptions() {
    try {
        const res = await fetch('/v1/products/options');
        if (!res.ok) throw new Error('Failed to fetch options');
        const options = await res.json();

        const tipoSelect = document.getElementById('productType');
        const unidadSelect = document.getElementById('productUnit');
        const ivaSelect = document.getElementById('productIva');

        populateSelect('productType', options.tiposArticulo);
        populateSelect('productUnit', options.unidadesMedida);
        populateSelect('productIva', options.ivas);

    } catch (error) {
        console.error("Error populating select options:", error);
        alert("No se pudieron cargar las opciones para el formulario. Intente de nuevo.");
    }
}

function populateSelect(selectId, items) {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Seleccione...</option>';
    items.forEach(item => {
        select.innerHTML += `<option value="${item.id}">${item.name}</option>`;
    });
}

async function productSave() {
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
        productCloseModal();
        // recargar la tabla para mostrar los cambios
        productsRender(currentFilter, productsCurrentPage);
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
        await productsRender(currentFilter, productsCurrentPage);
    } catch (error) {
        console.error(`Failed to ${actionText} product:`, error);
        alert(`Error: ${error.message}`);
    }
}

function productsUpdatePaginationUI(totalPages, currentPage) {

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
        button.addEventListener('click', () => productsRender(currentFilter, pageNumber));
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

function movementsUpdatePaginationUI(totalPages, currentPage) {
    if (!movementsPaginacionContainer || !movementsPrevBtn || !movementsNextBtn || !movementsPageInput) {
        console.error("Elementos de la UI de paginación de movimientos no encontrados.");
        return;
    }

    movementsPaginacionContainer.innerHTML = '';

    const appendNumericButton = (pageNumber) => {
        const button = document.createElement('button');
        button.className = `paginacion-boton indice ${pageNumber === currentPage ? 'active' : ''}`;
        button.textContent = pageNumber;
        button.addEventListener('click', () => movementsRender(currentFilter, pageNumber));
        movementsPaginacionContainer.appendChild(button);
    };

    const appendEllipsis = () => {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        ellipsis.className = 'paginacion-ellipsis';
        movementsPaginacionContainer.appendChild(ellipsis);
    };

    if (totalPages <= 0) {
        // No hay páginas
    } else if (totalPages <= 3) {
        for (let i = 1; i <= totalPages; i++) {
            appendNumericButton(i);
        }
    } else {
        const pagesToShowAroundCurrent = 1;

        appendNumericButton(1);

        if (currentPage > pagesToShowAroundCurrent + 1) {
            appendEllipsis();
        }

        for (let i = Math.max(2, currentPage - pagesToShowAroundCurrent); i <= Math.min(totalPages - 1, currentPage + pagesToShowAroundCurrent); i++) {
            appendNumericButton(i);
        }

        if (currentPage < totalPages - pagesToShowAroundCurrent - 1) {
            appendEllipsis();
        }

        appendNumericButton(totalPages);
    }

    movementsPrevBtn.disabled = currentPage === 1;
    if (currentPage === 1) {
        movementsPrevBtn.classList.add("disabled");
    } else {
        movementsPrevBtn.classList.remove("disabled");
    }

    movementsNextBtn.disabled = currentPage === totalPages;
    if (currentPage === totalPages) {
        movementsNextBtn.classList.add("disabled");
    } else {
        movementsNextBtn.classList.remove("disabled");
    }

    movementsPageInput.value = "...";
}


function initDashboard() {
    highlightActive();
    initMobileMenu();
    setupEventListeners();
    setupPaginationControls(); // configurar listeners de paginación estáticos
    productsRender(); // carga inicial de productos
}

document.addEventListener("DOMContentLoaded", initDashboard);
