import * as DOM from './domElements.js';
import { state } from './main.js';
import { populateSelect, salidasUpdatePaginationUI } from './ui.js';

export async function salidasRender(filter = "", page = 1, limit = 10) {
    try {
        const res = await fetch(`/v1/salidas?search=${encodeURIComponent(filter)}&page=${page}&limit=${limit}`);
        const data = await res.json();

        if (!data.salidas) return;

        state.salidas.currentPage = data.currentPage;
        state.salidas.totalPages = data.totalPages;

        if (data.salidas.length === 0) {
            DOM.outputTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center;">No se encontraron salidas.</td></tr>`;
        } else {
            DOM.outputTableBody.innerHTML = data.salidas.map((salida) => `
                <tr>
                    <td>${salida.Fecha}</td>
                    <td>${salida.ProductoNombre}</td>
                    <td>${salida.Cantidad}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-sm btn-secondary btn-edit-salida" data-id="${salida.id_Inv_Movimiento}">✏️</button>
                            <button class="btn btn-sm btn-danger btn-delete-salida" data-id="${salida.id_Inv_Movimiento}">🗑️</button>
                        </div>
                    </td>
                </tr>
            `).join("");
        }

        salidasUpdatePaginationUI(state.salidas.totalPages, state.salidas.currentPage);
    } catch (error) {
        console.error("Error rendering salidas:", error);
        DOM.outputTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center;">Error al cargar las salidas.</td></tr>`;
    }
}

async function openSalidaModalForCreate() {
    DOM.outputForm.reset();
    DOM.outputIdInput.value = '';
    document.getElementById('outputModalTitle').textContent = 'Registrar Nueva Salida';

    try {
        const response = await fetch('/v1/salidas/options');
        if (!response.ok) {
            throw new Error('No se pudieron cargar las opciones para el formulario.');
        }
        const options = await response.json();
        populateSelect('outputProduct', options.products);
        DOM.outputModalOverlay.style.display = 'flex';
    } catch (error) {
        console.error('Error al abrir modal para crear salida:', error);
        alert(error.message);
    }
}

async function openSalidaModalForEdit(salidaId) {
    DOM.outputForm.reset();
    DOM.outputIdInput.value = salidaId;

    try {
        const response = await fetch(`/v1/salidas/${salidaId}`);
        if (!response.ok) {
            throw new Error('No se pudo cargar la información de la salida.');
        }
        const { salida, options } = await response.json();
        document.getElementById('outputModalTitle').textContent = 'Editar Salida';

        populateSelect('outputProduct', options.products);

        if (salida.fecha) {
            salida.fecha = salida.fecha.split(' ')[0];
        }

        for (const key in salida) {
            if (DOM.outputForm.elements[key]) {
                DOM.outputForm.elements[key].value = salida[key];
            }
        }

        DOM.outputModalOverlay.style.display = 'flex';

    } catch (error) {
        console.error('Error al abrir el modal de edición de salida:', error);
        alert(error.message);
    }
}

function closeSalidaModal() {
    if (DOM.outputModalOverlay) {
        DOM.outputModalOverlay.style.display = 'none';
    }
}

async function saveSalida() {
    const formData = new FormData(DOM.outputForm);
    const salidaData = Object.fromEntries(formData.entries());
    const salidaId = DOM.outputIdInput.value;

    const isUpdating = !!salidaId;
    const url = isUpdating ? `/v1/salidas/${salidaId}` : '/v1/salidas';
    const method = isUpdating ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(salidaData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error al ${isUpdating ? 'actualizar' : 'crear'} la salida`);
        }

        alert(`Salida ${isUpdating ? 'actualizada' : 'creada'} exitosamente`);
        closeSalidaModal();
        salidasRender(state.currentFilter, state.salidas.currentPage);
    } catch (error) {
        console.error('Failed to save salida:', error);
        alert(`Error: ${error.message}`);
    }
}

async function toggleSalidaStatus(salidaId) {
    const confirmation = confirm('¿Estás seguro de que deseas desactivar esta salida?');
    if (!confirmation) return;

    try {
        const response = await fetch(`/v1/salidas/${salidaId}/toggle-status`, { method: 'PATCH' });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al cambiar el estado de la salida.');
        }
        alert('Estado de la salida cambiado exitosamente.');
        salidasRender(state.currentFilter, state.salidas.currentPage);
    } catch (error) {
        console.error('Failed to toggle salida status:', error);
        alert(`Error: ${error.message}`);
    }
}

export function setupSalidaEventListeners() {
    if (DOM.addOutputBtn) DOM.addOutputBtn.addEventListener('click', openSalidaModalForCreate);
    if (DOM.closeOutputModalBtn) DOM.closeOutputModalBtn.addEventListener('click', closeSalidaModal);
    if (DOM.cancelOutputModalBtn) DOM.cancelOutputModalBtn.addEventListener('click', closeSalidaModal);
    if (DOM.outputModalOverlay) {
        DOM.outputModalOverlay.addEventListener('click', (e) => {
            if (e.target === DOM.outputModalOverlay) closeSalidaModal();
        });
    }
    if (DOM.outputForm) {
        DOM.outputForm.addEventListener('submit', (e) => { e.preventDefault(); saveSalida(); });
    }
    DOM.outputTableBody.addEventListener('click', (e) => {
        const editButton = e.target.closest('.btn-edit-salida');
        if (editButton) openSalidaModalForEdit(editButton.dataset.id);

        const deleteButton = e.target.closest('.btn-delete-salida');
        if (deleteButton) toggleSalidaStatus(deleteButton.dataset.id);
    });
}