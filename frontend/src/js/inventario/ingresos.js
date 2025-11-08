import * as DOM from './domElements.js';
import { state } from './main.js';
import { populateSelect, incomesUpdatePaginationUI } from './ui.js';

export async function incomesRender(filter = "", page = 1, limit = 10) {
    try {
        const res = await fetch(`/v1/incomes?search=${encodeURIComponent(filter)}&page=${page}&limit=${limit}`);
        const data = await res.json();

        if (!data.incomes) return;

        state.incomes.currentPage = data.currentPage;
        state.incomes.totalPages = data.totalPages;

        if (data.incomes.length === 0) {
            DOM.incomeTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center;">No se encontraron ingresos.</td></tr>`;
        } else {
            DOM.incomeTableBody.innerHTML = data.incomes.map((income) => `
                <tr>
                    <td>${income.Fecha}</td>
                    <td>${income.ProductoNombre}</td>
                    <td>${income.Cantidad}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-sm btn-secondary btn-edit-income" data-id="${income.id_Inv_Movimiento}">✏️</button>
                            <button class="btn btn-sm btn-danger btn-delete-income" data-id="${income.id_Inv_Movimiento}">🗑️</button>
                        </div>
                    </td>
                </tr>
            `).join("");
        }

        incomesUpdatePaginationUI(state.incomes.totalPages, state.incomes.currentPage);
    } catch (error) {
        console.error("Error rendering incomes:", error);
        DOM.incomeTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center;">Error al cargar los ingresos.</td></tr>`;
    }
}

async function openIncomeModalForCreate() {
    DOM.incomeForm.reset();
    DOM.incomeIdInput.value = '';
    document.getElementById('incomeModalTitle').textContent = 'Registrar Nuevo Ingreso';

    try {
        const response = await fetch('/v1/incomes/options');
        if (!response.ok) {
            throw new Error('No se pudieron cargar las opciones para el formulario.');
        }
        const options = await response.json();
        populateSelect('incomeProduct', options.products);
        DOM.incomeModalOverlay.style.display = 'flex';
    } catch (error) {
        console.error('Error al abrir modal para crear ingreso:', error);
        alert(error.message);
    }
}

async function openIncomeModalForEdit(incomeId) {
    DOM.incomeForm.reset();
    DOM.incomeIdInput.value = incomeId;

    try {
        const response = await fetch(`/v1/incomes/${incomeId}`);
        if (!response.ok) {
            throw new Error('No se pudo cargar la información del ingreso.');
        }
        const { income, options } = await response.json();
        document.getElementById('incomeModalTitle').textContent = 'Editar Ingreso';

        populateSelect('incomeProduct', options.products);

        // Formatear la fecha para el input type="date"
        if (income.fecha) {
            income.fecha = income.fecha.split(' ')[0];
        }

        for (const key in income) {
            if (DOM.incomeForm.elements[key]) {
                DOM.incomeForm.elements[key].value = income[key];
            }
        }

        DOM.incomeModalOverlay.style.display = 'flex';

    } catch (error) {
        console.error('Error al abrir el modal de edición de ingreso:', error);
        alert(error.message);
    }
}

function closeIncomeModal() {
    if (DOM.incomeModalOverlay) {
        DOM.incomeModalOverlay.style.display = 'none';
    }
}

async function saveIncome() {
    const formData = new FormData(DOM.incomeForm);
    const incomeData = Object.fromEntries(formData.entries());
    const incomeId = DOM.incomeIdInput.value;

    const isUpdating = !!incomeId;
    const url = isUpdating ? `/v1/incomes/${incomeId}` : '/v1/incomes';
    const method = isUpdating ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(incomeData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error al ${isUpdating ? 'actualizar' : 'crear'} el ingreso`);
        }

        alert(`Ingreso ${isUpdating ? 'actualizado' : 'creado'} exitosamente`);
        closeIncomeModal();
        incomesRender(state.currentFilter, state.incomes.currentPage);
    } catch (error) {
        console.error('Failed to save income:', error);
        alert(`Error: ${error.message}`);
    }
}

async function toggleIncomeStatus(incomeId) {
    const confirmation = confirm('¿Estás seguro de que deseas desactivar este ingreso?');
    if (!confirmation) return;

    try {
        const response = await fetch(`/v1/incomes/${incomeId}/toggle-status`, { method: 'PATCH' });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al cambiar el estado del ingreso.');
        }
        alert('Estado del ingreso cambiado exitosamente.');
        incomesRender(state.currentFilter, state.incomes.currentPage);
    } catch (error) {
        console.error('Failed to toggle income status:', error);
        alert(`Error: ${error.message}`);
    }
}

export function setupIncomeEventListeners() {
    if (DOM.addIncomeBtn) DOM.addIncomeBtn.addEventListener('click', openIncomeModalForCreate);
    if (DOM.closeIncomeModalBtn) DOM.closeIncomeModalBtn.addEventListener('click', closeIncomeModal);
    if (DOM.cancelIncomeModalBtn) DOM.cancelIncomeModalBtn.addEventListener('click', closeIncomeModal);
    if (DOM.incomeModalOverlay) {
        DOM.incomeModalOverlay.addEventListener('click', (e) => {
            if (e.target === DOM.incomeModalOverlay) closeIncomeModal();
        });
    }
    if (DOM.incomeForm) {
        DOM.incomeForm.addEventListener('submit', (e) => { e.preventDefault(); saveIncome(); });
    }
    DOM.incomeTableBody.addEventListener('click', (e) => {
        const editButton = e.target.closest('.btn-edit-income');
        if (editButton) openIncomeModalForEdit(editButton.dataset.id);

        const deleteButton = e.target.closest('.btn-delete-income');
        if (deleteButton) toggleIncomeStatus(deleteButton.dataset.id);
    });
}
