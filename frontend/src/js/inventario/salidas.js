import * as DOM from './domElements.js';
import { state } from './main.js';
import { populateSelect, salidasUpdatePaginationUI } from './ui.js';

// renderiza la tabla de salidas, obtiene los datos de la api.
export async function salidasRender(filter = "", page = 1, limit = 10) {
    try {
        // hace la peticion a la api para obtener las salidas.
        const res = await fetch(`/v1/salidas?search=${encodeURIComponent(filter)}&page=${page}&limit=${limit}`);
        const data = await res.json();

        if (!data.salidas) return;

        // actualiza el estado de la paginacion.
        state.salidas.currentPage = data.currentPage;
        state.salidas.totalPages = data.totalPages;

        // si no hay salidas, muestra un mensaje. si hay, las renderiza en la tabla.
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

        // actualiza la interfaz de usuario de la paginacion.
        salidasUpdatePaginationUI(state.salidas.totalPages, state.salidas.currentPage);
    } catch (error) {
        console.error("Error rendering salidas:", error);
        DOM.outputTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center;">Error al cargar las salidas.</td></tr>`;
    }
}

// abre el modal para crear una nueva salida.
async function openSalidaModalForCreate() {
    DOM.outputForm.reset();
    DOM.outputIdInput.value = '';
    document.getElementById('outputModalTitle').textContent = 'Registrar Nueva Salida';

    try {
        // obtiene las opciones (productos) para el select del formulario.
        const response = await fetch('/v1/salidas/options');
        if (!response.ok) {
            throw new Error('No se pudieron cargar las opciones para el formulario.');
        }
        const options = await response.json();
        // rellena el select y muestra el modal.
        populateSelect('outputProduct', options.products);
        DOM.outputModalOverlay.style.display = 'flex';
    } catch (error) {
        console.error('Error al abrir modal para crear salida:', error);
        alert(error.message);
    }
}

// abre el modal para editar una salida existente.
async function openSalidaModalForEdit(salidaId) {
    DOM.outputForm.reset();
    DOM.outputIdInput.value = salidaId;

    try {
        // obtiene los datos de la salida y las opciones para el formulario.
        const response = await fetch(`/v1/salidas/${salidaId}`);
        if (!response.ok) {
            throw new Error('No se pudo cargar la información de la salida.');
        }
        const { salida, options } = await response.json();
        document.getElementById('outputModalTitle').textContent = 'Editar Salida';

        // rellena el select de productos.
        populateSelect('outputProduct', options.products);

        // rellena el formulario con los datos de la salida.
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

// cierra el modal de salida.
function closeSalidaModal() {
    if (DOM.outputModalOverlay) {
        DOM.outputModalOverlay.style.display = 'none';
    }
}

// guarda una salida (crea una nueva o actualiza una existente).
async function saveSalida() {
    const formData = new FormData(DOM.outputForm);
    const salidaData = Object.fromEntries(formData.entries());
    const salidaId = DOM.outputIdInput.value;

    const isUpdating = !!salidaId;
    const url = isUpdating ? `/v1/salidas/${salidaId}` : '/v1/salidas';
    const method = isUpdating ? 'PUT' : 'POST';

    // envia la peticion a la api.
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
        // vuelve a renderizar la tabla para mostrar los cambios.
        salidasRender(state.currentFilter, state.salidas.currentPage);
    } catch (error) {
        console.error('Failed to save salida:', error);
        alert(`Error: ${error.message}`);
    }
}

// cambia el estado de una salida (la desactiva).
async function toggleSalidaStatus(salidaId) {
    const confirmation = confirm('¿Estás seguro de que deseas desactivar esta salida?');
    if (!confirmation) return;

    try {
        // envia la peticion patch para cambiar el estado.
        const response = await fetch(`/v1/salidas/${salidaId}/toggle-status`, { method: 'PATCH' });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al cambiar el estado de la salida.');
        }
        alert('Estado de la salida cambiado exitosamente.');
        // vuelve a renderizar la tabla para reflejar el cambio.
        salidasRender(state.currentFilter, state.salidas.currentPage);
    } catch (error) {
        console.error('Failed to toggle salida status:', error);
        alert(`Error: ${error.message}`);
    }
}

// configura todos los listeners de eventos para la seccion de salidas.
export function setupSalidaEventListeners() {
    // listeners para abrir y cerrar el modal.
    if (DOM.addOutputBtn) DOM.addOutputBtn.addEventListener('click', openSalidaModalForCreate);
    if (DOM.closeOutputModalBtn) DOM.closeOutputModalBtn.addEventListener('click', closeSalidaModal);
    if (DOM.cancelOutputModalBtn) DOM.cancelOutputModalBtn.addEventListener('click', closeSalidaModal);
    if (DOM.outputModalOverlay) {
        // cierra el modal si se hace clic fuera del contenido.
        DOM.outputModalOverlay.addEventListener('click', (e) => {
            if (e.target === DOM.outputModalOverlay) closeSalidaModal();
        });
    }
    // listener para el envio del formulario.
    if (DOM.outputForm) {
        DOM.outputForm.addEventListener('submit', (e) => { e.preventDefault(); saveSalida(); });
    }

    // delegacion de eventos en la tabla para los botones de editar y eliminar.
    DOM.outputTableBody.addEventListener('click', (e) => {
        const editButton = e.target.closest('.btn-edit-salida');
        if (editButton) openSalidaModalForEdit(editButton.dataset.id);

        const deleteButton = e.target.closest('.btn-delete-salida');
        if (deleteButton) toggleSalidaStatus(deleteButton.dataset.id);
    });
}