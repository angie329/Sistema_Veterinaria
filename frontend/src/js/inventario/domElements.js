// --- elementos del dom ---

// pestañas
export const tabButtons = document.querySelectorAll(".tab-btn");
export const tabContents = document.querySelectorAll(".tab-content");

// --- elementos de productos ---
export const productsTableBody = document.getElementById("productsTableBody");
export const addProductBtn = document.getElementById("addProductBtn");

// paginacion de productos
export const paginacionIndexesContainer = document.getElementById("paginacion-indexes");
export const prevButton = document.getElementById("previous");
export const nextButton = document.getElementById("next");
export const pageInput = document.getElementById("pageInput");

// modal de productos
export const productModalOverlay = document.getElementById("productModalOverlay");
export const productForm = document.getElementById("productForm");
export const closeModalBtn = document.getElementById("closeModalBtn");
export const cancelModalBtn = document.getElementById("cancelModalBtn");
export const productIdInput = document.getElementById('productId');

// --- elementos de movimientos ---
export const movementsTableBody = document.getElementById("movementsTableBody");
export const addMovementBtn = document.getElementById("addMovementBtn");

// modal de movimientos
export const movementModalOverlay = document.getElementById("movementModalOverlay");
export const movementForm = document.getElementById("movementForm");
export const closeMovementModalBtn = document.getElementById("closeMovementModalBtn");
export const cancelMovementModalBtn = document.getElementById("cancelMovementModalBtn");
export const movementIdInput = document.getElementById('movementId');

// --- elementos de ingresos ---
export const incomeTableBody = document.getElementById("incomeTableBody");
export const addIncomeBtn = document.getElementById("addIncomeBtn");

// modal de ingresos
export const incomeModalOverlay = document.getElementById("incomeModalOverlay");
export const incomeForm = document.getElementById("incomeForm");
export const closeIncomeModalBtn = document.getElementById("closeIncomeModalBtn");
export const cancelIncomeModalBtn = document.getElementById("cancelIncomeModalBtn");
export const incomeIdInput = document.getElementById('incomeId');

// paginacion de ingresos
export const incomesPrevBtn = document.getElementById("incomesPrev");
export const incomesNextBtn = document.getElementById("incomesNext");
export const incomesPageInput = document.getElementById("incomesPageInput");

// --- elementos de salidas ---
export const outputTableBody = document.getElementById("outputTableBody");
export const addOutputBtn = document.getElementById("addOutputBtn");

// modal de salidas
export const outputModalOverlay = document.getElementById("outputModalOverlay");
export const outputForm = document.getElementById("outputForm");
export const closeOutputModalBtn = document.getElementById("closeOutputModalBtn");
export const cancelOutputModalBtn = document.getElementById("cancelOutputModalBtn");
export const outputIdInput = document.getElementById('outputId');

// paginacion de salidas
export const outputsPrevBtn = document.getElementById("outputsPrev");
export const outputsNextBtn = document.getElementById("outputsNext");
export const outputsPageInput = document.getElementById("outputsPageInput");

// --- elementos de exportacion ---
export const exportProductBtn = document.getElementById("exportProductBtn");
export const exportIncomeBtn = document.getElementById("exportIncomeBtn");
export const exportOutputBtn = document.getElementById("exportOutputBtn");
export const exportMovementBtn = document.getElementById("exportMovementBtn");

// modal de exportacion
export const exportModalOverlay = document.getElementById("exportModalOverlay");
export const closeExportModalBtn = document.getElementById("closeExportModalBtn");
export const cancelExportModalBtn = document.getElementById("cancelExportModalBtn");

// --- elementos de busqueda ---
export const productSearchInput = document.getElementById("productSearchInput");
export const productSearchBtn = document.getElementById("productSearchBtn");
export const movementSearchInput = document.getElementById("movementSearchInput");
export const movementSearchBtn = document.getElementById("movementSearchBtn");
export const incomeSearchInput = document.getElementById("incomeSearchInput");
export const incomeSearchBtn = document.getElementById("incomeSearchBtn");
export const outputSearchInput = document.getElementById("outputSearchInput");
export const outputSearchBtn = document.getElementById("outputSearchBtn");
