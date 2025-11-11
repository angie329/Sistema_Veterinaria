import * as DOM from './domElements.js';
import { state } from './main.js';
import { populateSelect, productsUpdatePaginationUI } from './ui.js';

// renderiza la tabla de productos, obtiene los datos de la api.
export async function productsRender(filter = "", page = 1, limit = 10) {
    try {
        // hace la peticion a la api para obtener los productos.
        const res = await fetch(`http://localhost:3008/v1/products?search=${encodeURIComponent(filter)}&page=${page}&limit=${limit}`);
        const data = await res.json();

        if (!data.products) return;

        // actualiza el estado de la paginacion.
        state.products.currentPage = data.currentPage;
        state.products.totalPages = data.totalPages;

        // si no hay productos, muestra un mensaje. si hay, los renderiza en la tabla.
        if (DOM.productsTableBody.length === 0) {
            DOM.productsTableBody.innerHTML = `<tr><td colspan="10" style="text-align: center;">No se encontraron productos.</td></tr>`;
        } else {
            DOM.productsTableBody.innerHTML = data.products.map((product) => `
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
        }

        // actualiza la interfaz de usuario de la paginacion.
        productsUpdatePaginationUI(state.products.totalPages, state.products.currentPage);
    } catch (error) {
        console.error("Error rendering products:", error);
        DOM.productsTableBody.innerHTML = `<tr><td colspan="10" style="text-align: center;">Error al cargar los productos.</td></tr>`;
    }
}

// abre el modal para crear un nuevo producto.
async function productOpenModal() {
    DOM.productForm.reset();
    DOM.productIdInput.value = '';
    document.getElementById('modalTitle').textContent = 'Agregar Nuevo Producto';
    // carga las opciones de los selects (tipo, unidad, iva).
    await populateSelectOptions();
    // muestra el modal
    DOM.productModalOverlay.style.display = 'flex';
}

// abre el modal para editar un producto existente.
async function productOpenModalForEdit(productId) {
    DOM.productForm.reset();
    document.getElementById('modalTitle').textContent = 'Editar Producto';
    DOM.productIdInput.value = productId;

    try {
        // ejecuta en paralelo la carga de opciones y la obtencion de datos del producto.
        const [_, productResponse] = await Promise.all([
            populateSelectOptions(),
            fetch(`/v1/products/${productId}`)
        ]);

        if (!productResponse.ok) throw new Error('No se pudo cargar la información del producto.');

        const product = await productResponse.json();

        // rellena el formulario con los datos del producto.
        for (const key in product) {
            if (DOM.productForm.elements[key]) {
                DOM.productForm.elements[key].value = product[key];
            }
        }
        DOM.productModalOverlay.style.display = 'flex';
    } catch (error) {
        console.error('Error al abrir el modal de edición:', error);
        alert(error.message);
    }
}

// cierra el modal de producto.
function productCloseModal() {
    DOM.productModalOverlay.style.display = 'none';
}

// guarda un producto (crea uno nuevo o actualiza uno existente).
async function productSave() {
    const formData = new FormData(DOM.productForm);
    const productData = Object.fromEntries(formData.entries());
    const productId = DOM.productIdInput.value;

    const isUpdating = !!productId;
    const url = isUpdating ? `/v1/products/${productId}` : '/v1/products';
    const method = isUpdating ? 'PUT' : 'POST';

    // envia la peticion a la api.
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
        // vuelve a renderizar la tabla para mostrar los cambios.
        productsRender(state.currentFilter, state.products.currentPage);
    } catch (error) {
        console.error('Failed to save product:', error);
        alert(`Error: ${error.message}`);
    }
}

// cambia el estado de un producto (activo/inactivo).
async function toggleProductStatus(productId) {
    const confirmation = confirm(`¿Estás seguro de que deseas cambiar el estado de este producto?`);
    if (!confirmation) return;

    try {
        // envia la peticion patch para cambiar el estado.
        const response = await fetch(`/v1/products/${productId}/toggle-status`, { method: 'PATCH' });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error al cambiar el estado del producto.`);
        }
        // vuelve a renderizar la tabla para reflejar el cambio.
        await productsRender(state.currentFilter, state.products.currentPage);
    } catch (error) {
        console.error(`Failed to toggle product status:`, error);
        alert(`Error: ${error.message}`);
    }
}

// obtiene las opciones para los selects del formulario desde la api.
async function populateSelectOptions() {
    try {
        const res = await fetch('/v1/products/options');
        if (!res.ok) throw new Error('Failed to fetch options');
        const options = await res.json();

        // rellena cada select con sus respectivas opciones.
        populateSelect('productType', options.tiposArticulo);
        populateSelect('productUnit', options.unidadesMedida);
        populateSelect('productIva', options.ivas);
    } catch (error) {
        console.error("Error populating select options:", error);
        alert("No se pudieron cargar las opciones para el formulario. Intente de nuevo.");
    }
}

// configura todos los listeners de eventos para la seccion de productos.
export function setupProductEventListeners() {
    // listeners para abrir y cerrar el modal.
    DOM.addProductBtn.addEventListener('click', productOpenModal);
    DOM.closeModalBtn.addEventListener('click', productCloseModal);
    DOM.cancelModalBtn.addEventListener('click', productCloseModal);
    DOM.productModalOverlay.addEventListener('click', (e) => {
        if (e.target === DOM.productModalOverlay) productCloseModal();
    });
    // listener para el envio del formulario.
    DOM.productForm.addEventListener('submit', (e) => { e.preventDefault(); productSave(); });

    // listener para cerrar el modal con la tecla 'escape'.
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && DOM.productModalOverlay.style.display !== 'none') productCloseModal();
    });

    // delegacion de eventos en la tabla para los botones de editar y eliminar.
    DOM.productsTableBody.addEventListener('click', (e) => {
        const editButton = e.target.closest('.btn-edit');
        if (editButton) productOpenModalForEdit(editButton.dataset.id);

        const toggleButton = e.target.closest('.btn-toggle-status');
        if (toggleButton) toggleProductStatus(toggleButton.dataset.id);
    });
}