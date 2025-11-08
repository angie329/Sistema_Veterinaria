import * as DOM from './domElements.js';
import { state } from './main.js';
import { populateSelect, productsUpdatePaginationUI } from './ui.js';

export async function productsRender(filter = "", page = 1, limit = 10) {
    try {
        const res = await fetch(`/v1/products?search=${encodeURIComponent(filter)}&page=${page}&limit=${limit}`);
        const data = await res.json();

        if (!data.products) return;

        state.products.currentPage = data.currentPage;
        state.products.totalPages = data.totalPages;

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

        productsUpdatePaginationUI(state.products.totalPages, state.products.currentPage);
    } catch (error) {
        console.error("Error rendering products:", error);
        DOM.productsTableBody.innerHTML = `<tr><td colspan="10" style="text-align: center;">Error al cargar los productos.</td></tr>`;
    }
}

async function productOpenModal() {
    DOM.productForm.reset();
    DOM.productIdInput.value = '';
    document.getElementById('modalTitle').textContent = 'Agregar Nuevo Producto';
    await populateSelectOptions();
    DOM.productModalOverlay.style.display = 'flex';
}

async function productOpenModalForEdit(productId) {
    DOM.productForm.reset();
    document.getElementById('modalTitle').textContent = 'Editar Producto';
    DOM.productIdInput.value = productId;

    try {
        const [_, productResponse] = await Promise.all([
            populateSelectOptions(),
            fetch(`/v1/products/${productId}`)
        ]);

        if (!productResponse.ok) throw new Error('No se pudo cargar la información del producto.');

        const product = await productResponse.json();

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

function productCloseModal() {
    DOM.productModalOverlay.style.display = 'none';
}

async function productSave() {
    const formData = new FormData(DOM.productForm);
    const productData = Object.fromEntries(formData.entries());
    const productId = DOM.productIdInput.value;

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
        productsRender(state.currentFilter, state.products.currentPage);
    } catch (error) {
        console.error('Failed to save product:', error);
        alert(`Error: ${error.message}`);
    }
}

async function toggleProductStatus(productId) {
    const confirmation = confirm(`¿Estás seguro de que deseas cambiar el estado de este producto?`);
    if (!confirmation) return;

    try {
        const response = await fetch(`/v1/products/${productId}/toggle-status`, { method: 'PATCH' });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error al cambiar el estado del producto.`);
        }
        await productsRender(state.currentFilter, state.products.currentPage);
    } catch (error) {
        console.error(`Failed to toggle product status:`, error);
        alert(`Error: ${error.message}`);
    }
}

async function populateSelectOptions() {
    try {
        const res = await fetch('/v1/products/options');
        if (!res.ok) throw new Error('Failed to fetch options');
        const options = await res.json();

        populateSelect('productType', options.tiposArticulo);
        populateSelect('productUnit', options.unidadesMedida);
        populateSelect('productIva', options.ivas);
    } catch (error) {
        console.error("Error populating select options:", error);
        alert("No se pudieron cargar las opciones para el formulario. Intente de nuevo.");
    }
}

export function setupProductEventListeners() {
    DOM.addProductBtn.addEventListener('click', productOpenModal);
    DOM.closeModalBtn.addEventListener('click', productCloseModal);
    DOM.cancelModalBtn.addEventListener('click', productCloseModal);
    DOM.productModalOverlay.addEventListener('click', (e) => {
        if (e.target === DOM.productModalOverlay) productCloseModal();
    });
    DOM.productForm.addEventListener('submit', (e) => { e.preventDefault(); productSave(); });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && DOM.productModalOverlay.style.display !== 'none') productCloseModal();
    });

    DOM.productsTableBody.addEventListener('click', (e) => {
        const editButton = e.target.closest('.btn-edit');
        if (editButton) productOpenModalForEdit(editButton.dataset.id);

        const toggleButton = e.target.closest('.btn-toggle-status');
        if (toggleButton) toggleProductStatus(toggleButton.dataset.id);
    });
}