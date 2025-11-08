import * as DOM from './domElements.js';
import { state } from './main.js';
import { populateSelect, movementsUpdatePaginationUI } from './ui.js';

export async function movementsRender(filter = "", page = 1, limit = 10) {
    try {
        const res = await fetch(`/v1/movements?search=${encodeURIComponent(filter)}&page=${page}&limit=${limit}`);
        const data = await res.json(); // { movements, totalPages, currentPage }

        if (!data.movements) return;

        state.movements.currentPage = data.currentPage;
        state.movements.totalPages = data.totalPages;

        if (data.movements.length === 0) {
            DOM.movementsTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No se encontraron movimientos.</td></tr>`;
        } else {
            DOM.movementsTableBody.innerHTML = data.movements.map(mov => `
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
                            <button class="btn btn-sm btn-danger btn-toggle-status-movement" data-id="${mov.id_Inv_Movimiento}">🗑️</button>
                        </div>
                    </td>
                </tr>
            `).join("");
        }

        movementsUpdatePaginationUI(state.movements.totalPages, state.movements.currentPage);

    } catch (error) {
        console.error("Error rendering movements:", error);
        if (DOM.movementsTableBody) {
            DOM.movementsTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Error al cargar los movimientos.</td></tr>`;
        }
    }
}

async function openMovementModalForCreate() {
    DOM.movementForm.reset();
    DOM.movementIdInput.value = '';
    document.getElementById('movementModalTitle').textContent = 'Registrar Nuevo Movimiento';

    try {
        const response = await fetch('/v1/movements/options');
        if (!response.ok) {
            throw new Error('No se pudieron cargar las opciones para el formulario.');
        }
        const options = await response.json();

        populateSelect('movementProduct', options.products);
        populateSelect('movementType', options.movementTypes);

        DOM.movementModalOverlay.style.display = 'flex';
    } catch (error) {
        console.error('Error al abrir modal para crear movimiento:', error);
        alert(error.message);
    }
}

async function openMovementModalForEdit(movementId) {
    DOM.movementForm.reset();
    DOM.movementIdInput.value = movementId;

    try {
        const response = await fetch(`/v1/movements/${movementId}`);
        if (!response.ok) {
            throw new Error('No se pudo cargar la información del movimiento.');
        }
        const { movement, options } = await response.json();
        document.getElementById('movementModalTitle').textContent = 'Editar Movimiento';

        populateSelect('movementProduct', options.products);
        populateSelect('movementType', options.movementTypes);

        for (const key in movement) {
            if (DOM.movementForm.elements[key]) {
                DOM.movementForm.elements[key].value = movement[key];
            }
        }

        DOM.movementModalOverlay.style.display = 'flex';

    } catch (error) {
        console.error('Error al abrir el modal de edición de movimiento:', error);
        alert(error.message);
    }
}

function closeMovementModal() {
    if (DOM.movementModalOverlay) {
        DOM.movementModalOverlay.style.display = 'none';
    }
}

async function saveMovement() {
    const formData = new FormData(DOM.movementForm);
    const movementData = Object.fromEntries(formData.entries());
    delete movementData.movementId;
    const movementId = DOM.movementIdInput.value;

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
        movementsRender(state.currentFilter, state.movements.currentPage);
    } catch (error) {
        console.error('Failed to save movement:', error);
        alert(`Error: ${error.message}`);
    }
}

async function toggleMovementStatus(movementId) {
    const confirmation = confirm('¿Estás seguro de que deseas desactivar este movimiento?');
    if (!confirmation) return;

    try {
        const response = await fetch(`/v1/movements/${movementId}/toggle-status`, { method: 'PATCH' });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al cambiar el estado del movimiento.');
        }
        alert('Estado del movimiento cambiado exitosamente.');
        movementsRender(state.currentFilter, state.movements.currentPage);
    } catch (error) {
        console.error('Failed to toggle movement status:', error);
        alert(`Error: ${error.message}`);
    }
}

export function setupMovementEventListeners() {
    if (DOM.addMovementBtn) DOM.addMovementBtn.addEventListener('click', openMovementModalForCreate);
    if (DOM.closeMovementModalBtn) DOM.closeMovementModalBtn.addEventListener('click', closeMovementModal);
    if (DOM.cancelMovementModalBtn) DOM.cancelMovementModalBtn.addEventListener('click', closeMovementModal);
    if (DOM.movementModalOverlay) {
        DOM.movementModalOverlay.addEventListener('click', (e) => {
            if (e.target === DOM.movementModalOverlay) closeMovementModal();
        });
    }
    if (DOM.movementForm) {
        DOM.movementForm.addEventListener('submit', (e) => { e.preventDefault(); saveMovement(); });
    }
    DOM.movementsTableBody.addEventListener('click', (e) => {
        const editButton = e.target.closest('.btn-edit-movement');
        if (editButton) openMovementModalForEdit(editButton.dataset.id);

        const toggleButton = e.target.closest('.btn-toggle-status-movement');
        if (toggleButton) toggleMovementStatus(toggleButton.dataset.id);
    });
}