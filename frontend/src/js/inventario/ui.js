import * as DOM from './domElements.js';
import { state } from './main.js';
import { productsRender } from './products.js';
import { movementsRender } from './movements.js';
import { incomesRender } from './ingresos.js';
import { salidasRender } from './salidas.js';


// configura los listeners para la navegacion por pestañas.
export function setupTabNavigation() {
    // recorre todos los botones de las pestañas.
    DOM.tabButtons.forEach((button) => {
        // a cada boton le añade un evento de click.
        button.addEventListener("click", () => {
            // obtiene el nombre de la pestaña desde el atributo 'data-tab'.
            const tabName = button.getAttribute("data-tab");
            // llama a la funcion para cambiar a esa pestaña.
            switchTab(tabName);
        });
    });
}

// funcion para cambiar la pestaña visible.
function switchTab(tabName) {
    // quita la clase 'active' de todos los botones de pestaña.
    DOM.tabButtons.forEach((btn) => btn.classList.remove("active"));
    // quita la clase 'active' de todos los contenidos de pestaña.
    DOM.tabContents.forEach((content) => content.classList.remove("active"));

    // busca el boton y el contenido que corresponden a la pestaña seleccionada.
    const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
    const activeContent = document.getElementById(tabName);

    // añade la clase 'active' para mostrar el boton y el contenido correctos.
    if (activeButton) activeButton.classList.add("active");
    if (activeContent) activeContent.classList.add("active");

    // si se cambia a la pestaña 'movimientos' y su tabla esta vacia, carga los datos.
    if (tabName === 'movimientos' && DOM.movementsTableBody.childElementCount === 0) {
        movementsRender();
    }

    if (tabName === 'salidas' && DOM.outputTableBody.childElementCount === 0) {
        salidasRender();
    }

    if (tabName === 'salidas' && DOM.outputTableBody.childElementCount === 0) {
        salidasRender();
    }

    if (tabName === 'ingresos' && DOM.incomeTableBody.childElementCount === 0) {
        incomesRender();
    }

}

export function setupPaginationControls() {
    // Paginación de Productos
    // listener para el boton 'anterior' de productos.
    DOM.prevButton?.addEventListener('click', () => {
        if (state.products.currentPage > 1) productsRender(state.currentFilter, state.products.currentPage - 1);
    });
    // listener para el boton 'siguiente' de productos.
    DOM.nextButton?.addEventListener('click', () => {
        if (state.products.currentPage < state.products.totalPages) productsRender(state.currentFilter, state.products.currentPage + 1);
    });
    // listener para el input de pagina de productos (cuando se presiona 'enter').
    DOM.pageInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const page = parseInt(e.target.value, 10);
            if (!isNaN(page) && page > 0 && page <= state.products.totalPages) {
                productsRender(state.currentFilter, page);
            } else {
                alert(`Por favor, introduce un número de página válido entre 1 y ${state.products.totalPages}.`);
            }
        }
    });

    // Paginación de Movimientos
    // se obtienen los elementos especificos para la paginacion de movimientos.
    const movementsPrevBtn = document.getElementById("movementsPrev");
    const movementsNextBtn = document.getElementById("movementsNext");
    const movementsPageInput = document.getElementById("movementsPageInput");

    // listener para el boton 'anterior' de movimientos.
    movementsPrevBtn?.addEventListener('click', () => {
        if (state.movements.currentPage > 1) movementsRender(state.currentFilter, state.movements.currentPage - 1);
    });
    // listener para el boton 'siguiente' de movimientos.
    movementsNextBtn?.addEventListener('click', () => {
        if (state.movements.currentPage < state.movements.totalPages) movementsRender(state.currentFilter, state.movements.currentPage + 1);
    });
    // listener para el input de pagina de movimientos (cuando se presiona 'enter').
    movementsPageInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const page = parseInt(e.target.value, 10);
            if (!isNaN(page) && page > 0 && page <= state.movements.totalPages) {
                movementsRender(state.currentFilter, page);
            } else {
                alert(`Por favor, introduce un número de página válido entre 1 y ${state.movements.totalPages}.`);
            }
        }
    });

    // Paginacion de Ingresos
    DOM.incomesPrevBtn?.addEventListener('click', () => {
        if (state.incomes.currentPage > 1) incomesRender(state.currentFilter, state.incomes.currentPage - 1);
    });
    DOM.incomesNextBtn?.addEventListener('click', () => {
        if (state.incomes.currentPage < state.incomes.totalPages) incomesRender(state.currentFilter, state.incomes.currentPage + 1);
    });
    DOM.incomesPageInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const page = parseInt(e.target.value, 10);
            if (!isNaN(page) && page > 0 && page <= state.incomes.totalPages) {
                incomesRender(state.currentFilter, page);
            } else {
                alert(`Por favor, introduce un número de página válido entre 1 y ${state.incomes.totalPages}.`);
            }
        }
    });

    // Paginacion de Salidas
    DOM.outputsPrevBtn?.addEventListener('click', () => {
        if (state.salidas.currentPage > 1) salidasRender(state.currentFilter, state.salidas.currentPage - 1);
    });
    DOM.outputsNextBtn?.addEventListener('click', () => {
        if (state.salidas.currentPage < state.salidas.totalPages) salidasRender(state.currentFilter, state.salidas.currentPage + 1);
    });
    DOM.outputsPageInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const page = parseInt(e.target.value, 10);
            if (!isNaN(page) && page > 0 && page <= state.salidas.totalPages) {
                salidasRender(state.currentFilter, page);
            } else {
                alert(`Por favor, introduce un número de página válido entre 1 y ${state.salidas.totalPages}.`);
            }
        }
    });

    // Paginacion de Salidas
    DOM.outputsPrevBtn?.addEventListener('click', () => {
        if (state.salidas.currentPage > 1) salidasRender(state.currentFilter, state.salidas.currentPage - 1);
    });
    DOM.outputsNextBtn?.addEventListener('click', () => {
        if (state.salidas.currentPage < state.salidas.totalPages) salidasRender(state.currentFilter, state.salidas.currentPage + 1);
    });
    DOM.outputsPageInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const page = parseInt(e.target.value, 10);
            if (!isNaN(page) && page > 0 && page <= state.salidas.totalPages) {
                salidasRender(state.currentFilter, page);
            } else {
                alert(`Por favor, introduce un número de página válido entre 1 y ${state.salidas.totalPages}.`);
            }
        }
    });


}

// funcion para rellenar un <select> con opciones.
export function populateSelect(selectId, items) {
    const select = document.getElementById(selectId);
    // limpia el select y añade una opcion por defecto.
    select.innerHTML = '<option value="">Seleccione...</option>';
    // recorre la lista de items y crea una <option> para cada uno.
    items.forEach(item => {
        select.innerHTML += `<option value="${item.id}">${item.name}</option>`;
    });
}

// funcion generica para actualizar la interfaz de la paginacion.
function updatePaginationUI(container, prevBtn, nextBtn, pageInput, totalPages, currentPage, renderFn) {
    // si falta algun elemento esencial, no hace nada.
    if (!container || !prevBtn || !nextBtn || !pageInput) return;

    // limpia los botones de indices de pagina anteriores.
    container.innerHTML = '';

    // funcion interna para crear y añadir un boton numerico.
    const appendNumericButton = (pageNumber) => {
        const button = document.createElement('button');
        // le pone clases css, y la clase 'active' si es la pagina actual.
        button.className = `paginacion-boton indice ${pageNumber === currentPage ? 'active' : ''}`;
        button.textContent = pageNumber;
        // le añade un listener que llama a la funcion de renderizado con el numero de pagina.
        button.addEventListener('click', () => renderFn(state.currentFilter, pageNumber));
        container.appendChild(button);
    };

    // funcion interna para añadir los puntos suspensivos.
    const appendEllipsis = () => {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        ellipsis.className = 'paginacion-ellipsis';
        container.appendChild(ellipsis);
    };

    // logica para decidir que botones mostrar.
    if (totalPages > 1) {
        // si hay 3 paginas o menos, muestra todos los numeros.
        if (totalPages <= 3) {
            for (let i = 1; i <= totalPages; i++) appendNumericButton(i);
        } else {
            // si hay mas de 3 paginas, usa una logica mas compleja.
            const pagesToShowAroundCurrent = 1;
            // siempre muestra la primera pagina.
            appendNumericButton(1);
            // muestra '...' si la pagina actual esta lejos del principio.
            if (currentPage > pagesToShowAroundCurrent + 1) appendEllipsis();
            // muestra las paginas alrededor de la actual.
            for (let i = Math.max(2, currentPage - pagesToShowAroundCurrent); i <= Math.min(totalPages - 1, currentPage + pagesToShowAroundCurrent); i++) {
                appendNumericButton(i);
            }
            // muestra '...' si la pagina actual esta lejos del final.
            if (currentPage < totalPages - pagesToShowAroundCurrent - 1) appendEllipsis();
            // siempre muestra la ultima pagina.
            appendNumericButton(totalPages);
        }
    }

    // deshabilita o habilita los botones 'anterior' y 'siguiente' segun corresponda.
    prevBtn.disabled = currentPage === 1;
    prevBtn.classList.toggle("disabled", currentPage === 1);
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    pageInput.value = "...";
}

// funcion especifica para actualizar la paginacion de productos.
export function productsUpdatePaginationUI(totalPages, currentPage) {
    updatePaginationUI(
        DOM.paginacionIndexesContainer,
        DOM.prevButton,
        DOM.nextButton,
        DOM.pageInput,
        totalPages,
        currentPage,
        productsRender
    );
}

// funcion especifica para actualizar la paginacion de movimientos.
export function movementsUpdatePaginationUI(totalPages, currentPage) {
    const movementsPaginacionContainer = document.getElementById("movementsPaginacionIndexes");
    const movementsPrevBtn = document.getElementById("movementsPrev");
    const movementsNextBtn = document.getElementById("movementsNext");
    const movementsPageInput = document.getElementById("movementsPageInput");

    updatePaginationUI(
        movementsPaginacionContainer,
        movementsPrevBtn,
        movementsNextBtn,
        movementsPageInput,
        totalPages,
        currentPage,
        movementsRender
    );
}

// funcion especifica para actualizar la paginacion de ingresos.
export function incomesUpdatePaginationUI(totalPages, currentPage) {
    const incomesPaginacionContainer = document.getElementById("incomesPaginacionIndexes");
    const incomesPrevBtn = document.getElementById("incomesPrev");
    const incomesNextBtn = document.getElementById("incomesNext");
    const incomesPageInput = document.getElementById("incomesPageInput");

    updatePaginationUI(
        incomesPaginacionContainer,
        incomesPrevBtn,
        incomesNextBtn,
        incomesPageInput,
        totalPages,
        currentPage,
        incomesRender
    );
}

// funcion especifica para actualizar la paginacion de salidas.
export function salidasUpdatePaginationUI(totalPages, currentPage) {
    const salidasPaginacionContainer = document.getElementById("outputsPaginacionIndexes");
    const salidasPrevBtn = document.getElementById("outputsPrev");
    const salidasNextBtn = document.getElementById("outputsNext");
    const salidasPageInput = document.getElementById("outputsPageInput");

    updatePaginationUI(
        salidasPaginacionContainer,
        salidasPrevBtn,
        salidasNextBtn,
        salidasPageInput,
        totalPages,
        currentPage,
        salidasRender
    );
}

