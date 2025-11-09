// === Configuración de la API ===
const API_URL = "http://localhost:3006/v1/dashboard";

// === Datos iniciales ===
let appointments = [];
let notifications = [];
let veterinarios = [];
let estadosCita = [];
let currentAgenda = [];

// === Funciones utilitarias ===
function formatTime(timestamp) {
	const date = new Date(timestamp);
	const now = new Date();
	const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
	if (diffInHours < 1) return "Hace unos minutos";
	if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? "s" : ""}`;
	const diffInDays = Math.floor(diffInHours / 24);
	return `Hace ${diffInDays} día${diffInDays > 1 ? "s" : ""}`;
}

function formatDateTime(dateTimeString) {
	const date = new Date(dateTimeString);
	const day = String(date.getDate()).padStart(2, '0');
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const year = date.getFullYear();
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// === Notificaciones ===
function createNotification(message) {
	notifications.push({ id: Date.now(), message, timestamp: new Date() });
	renderNotifications();
	showFloatingNotification(message);
}

function showFloatingNotification(message) {
	const container = document.getElementById("notificaciones");
	if (!container) return;

	const notif = document.createElement("div");
	notif.className = "floating-notification";
	notif.textContent = message;
	container.appendChild(notif);

	setTimeout(() => notif.classList.add("show"), 10);

	setTimeout(() => {
		notif.classList.remove("show");
		setTimeout(() => notif.remove(), 300);
	}, 3000);
}

// === Funciones de API ===
async function fetchVeterinarios() {
	try {
		const response = await fetch(`${API_URL}/veterinarians`);
		if (!response.ok) throw new Error("Error al cargar veterinarios");
		veterinarios = await response.json();
		renderVeterinarioSelects();
	} catch (error) {
		console.error(error);
		alert("No se pudieron cargar los veterinarios.");
	}
}

async function fetchEstadosCita() {
	try {
		const response = await fetch(`${API_URL}/appointment-states`);
		if (!response.ok) throw new Error("Error al cargar estados");
		estadosCita = await response.json();
		renderEstadosCitaSelect();
	} catch (error) {
		console.error(error);
		alert("No se pudieron cargar los estados de cita.");
	}
}

async function fetchAgenda(vetId) {
	try {
		const response = await fetch(`${API_URL}/veterinarians/${vetId}/schedule`);
		if (!response.ok) throw new Error("Error al cargar agenda");
		const agenda = await response.json();

		currentAgenda = agenda;
		renderAgendaFromAPI(agenda);
	} catch (error) {
		console.error(error);
		const agendaBody = document.getElementById("agendaBody");
		if (agendaBody) {
			agendaBody.innerHTML = `<tr><td colspan="4" style="color: red;">Error al cargar la agenda</td></tr>`;
		}
	}
}

async function fetchCitas() {
	try {
		const response = await fetch(`${API_URL}/appointments`);
		if (!response.ok) throw new Error("Error al cargar citas");
		appointments = await response.json();
		renderCitas();
	} catch (error) {
		console.error(error);
		alert("No se pudieron cargar las citas.");
	}
}

async function addAppointment(citaData) {
	try {
		const response = await fetch(`${API_URL}/appointments`, {
		  method: "POST",
		  headers: { "Content-Type": "application/json" },
		  body: JSON.stringify(citaData),
		});
		if (!response.ok) throw new Error("Error al crear cita");
		const nuevaCita = await response.json();
		appointments.push(nuevaCita);
		renderCitas();
		createNotification(`Nueva cita registrada para ${citaData.clientName}`);
	} catch (error) {
		console.error(error);
		alert("Error al crear la cita.");
	}
}

async function updateCita(id, updateData) {
	try {
		const response = await fetch(`${API_URL}/appointments/${id}`, {
		  method: "PUT",
		  headers: { "Content-Type": "application/json" },
		  body: JSON.stringify(updateData),
		});
		if (!response.ok) throw new Error("Error al actualizar cita");
		const citaActualizada = await response.json();
		const index = appointments.findIndex(a => a.id === id);
		if (index !== -1) appointments[index] = citaActualizada;
		renderCitas();
		createNotification(`Cita de ${citaActualizada.clientName} actualizada`);
	} catch (error) {
		console.error(error);
		alert("Error al actualizar la cita.");
	}
}

async function deleteCita(id) {
	try {
		const cita = appointments.find(a => a.id === id);
		if (!cita) return;
		const response = await fetch(`${API_URL}/appointments/${id}`, { method: "DELETE" });
		if (!response.ok) throw new Error("Error al eliminar cita");
		appointments = appointments.filter(a => a.id !== id);
		renderCitas();
		createNotification(`Cita de ${cita.clientName} eliminada`);
	} catch (error) {
		console.error(error);
		alert("Error al eliminar la cita.");
	}
}

// === Render Selects ===
function renderVeterinarioSelects() {
	const selectAgenda = document.getElementById("veterinarioSelect");
	const selectCita = document.getElementById("veterinarioCitaSelect");
	if (!selectAgenda || !selectCita) return;

	selectAgenda.innerHTML = `<option value="">-- Seleccione --</option>`;
	selectCita.innerHTML = `<option value="">Seleccione veterinario</option>`;

	veterinarios.forEach(vet => {
		const option1 = document.createElement("option");
		option1.value = vet.id;
		option1.textContent = vet.name;
		if (vet.specialty) option1.textContent += ` - ${vet.specialty}`;
		selectAgenda.appendChild(option1);

		const option2 = document.createElement("option");
		option2.value = vet.id;
		option2.textContent = option1.textContent;
		selectCita.appendChild(option2);
	});
}

function renderEstadosCitaSelect() {
	const select = document.getElementById("estadoCitaSelect");
	if (!select) return;

	select.innerHTML = `<option value="">Seleccione estado</option>`;
	estadosCita.forEach(e => {
		const option = document.createElement("option");
		option.value = e.id;
		option.textContent = e.nombre;
		if (e.descripcion) option.title = e.descripcion;
		select.appendChild(option);
	});
}

// === Render Agenda ===
function renderAgendaFromAPI(agenda) {
	const agendaBody = document.getElementById("agendaBody");
	if (!agendaBody) return;

	if (!agenda || agenda.length === 0) {
		agendaBody.innerHTML = `<tr><td colspan="4">Este veterinario no tiene horarios registrados</td></tr>`;
		return;
	}

	agendaBody.innerHTML = agenda
	.map(a => `<tr>
		<td>${a.day}</td>
		<td>${a.start}</td>
		<td>${a.end}</td>
		<td>${a.shift || '-'}</td>
	</tr>`).join("");
}

// === Render Notificaciones ===
function renderNotifications() {
	const listContainer = document.getElementById("notificationsList");
	const badge = document.querySelector("#notificationsBtn .header-badge");
	if (!listContainer || !badge) return;

	badge.textContent = notifications.length;
	if (notifications.length === 0) {
		listContainer.innerHTML = `<li class="notification-empty">No hay notificaciones</li>`;
		return;
	}

	listContainer.innerHTML = notifications
	.map(n => `<li class="notification-item">
		<span class="notification-message">${n.message}</span>
		<span class="notification-time">${formatTime(n.timestamp)}</span>
	</li>`).join("");
}

// === Status Badge ===
function getStatusBadge(status) {
	const statusMap = {
		'Pendiente': 'status-pending',
		'Confirmada': 'status-confirmed',
		'Completada': 'status-completed',
		'Cancelada': 'status-cancelled'
	};
	const className = statusMap[status] || 'status-pending';
	return `<span class="status-badge ${className}">${status}</span>`;
}

// === Render Citas ===
function renderCitas() {
	const citasBody = document.getElementById("citasBody");
	if (!citasBody) return;

	if (appointments.length === 0) {
		citasBody.innerHTML = `<tr><td colspan="8">No hay citas registradas</td></tr>`;
		return;
	}

	citasBody.innerHTML = appointments
	.map(cita => `<tr data-id="${cita.id}">
		<td>${cita.clientName}</td>
		<td>${cita.petName} (${cita.petType})</td>
		<td>${cita.veterinarian}</td>
		<td>${formatDateTime(cita.time)}</td>
		<td>${cita.reason}</td>
		<td>${cita.observaciones || '-'}</td>
		<td>${getStatusBadge(cita.status)}</td>
		<td class="actions-cell">
		<button class="icon-btn edit-btn" onclick="editAppointment(${cita.id})" title="Editar cita">
			<i data-lucide="pencil"></i>
		</button>
		<button class="icon-btn delete-btn" onclick="deleteAppointment(${cita.id})" title="Eliminar cita">
			<i data-lucide="trash-2"></i>
		</button>
		</td>
	</tr>`).join("");

	initIcons();
}

// === CRUD Citas ===
function editAppointment(id) {
	const cita = appointments.find(a => a.id === id);
	if (!cita) return;

	const newDateTime = prompt("Nueva fecha y hora (YYYY-MM-DDTHH:MM):", cita.time.substring(0,16));
	if (!newDateTime || newDateTime === cita.time) return;

	const vet = veterinarios.find(v => v.name === cita.veterinarian);
	updateCita(id, {
		time: newDateTime,
		veterinarianId: vet ? vet.id : null,
		veterinarian: cita.veterinarian,
		statusId: cita.statusId,
		status: cita.status
	});
}

function deleteAppointmentHandler(id) {
	if (confirm("¿Desea eliminar esta cita?")) deleteCita(id);
}

window.editAppointment = editAppointment;
window.deleteAppointment = deleteAppointmentHandler;

// === Formulario ===
const CITA_DURACION_MINUTOS = 30;

function initForm() {
	const form = document.getElementById("formCita");
	if (!form) return;

	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		const clientName = document.getElementById("clienteInput").value.trim();
		const petName = document.getElementById("mascotaInput").value.trim();
		const veterinarianSelect = document.getElementById("veterinarioCitaSelect");
		const vetId = parseInt(veterinarianSelect.value);
		const fechaCita = document.getElementById("fechaCitaInput").value;
		const motivo = document.getElementById("motivoInput").value.trim();
		const observaciones = document.getElementById("observacionesInput").value.trim();

		if (!clientName || !petName || !vetId || !fechaCita || !motivo) {
			return alert("Por favor complete todos los campos obligatorios.");
		}

		// --- Obtener agenda del veterinario ---
		const vetAgenda = await fetch(`${API_URL}/veterinarians/${vetId}/schedule`)
		.then(r => r.json())
		.catch(() => []);

		if (!vetAgenda || vetAgenda.length === 0) {
			return alert("Este veterinario no tiene horarios disponibles.");
		}

		// --- Convertir fecha/hora de la cita ---
		const citaDate = new Date(fechaCita);
		const citaDayName = citaDate.toLocaleDateString("es-ES", { weekday: "long" }); // lunes, martes...
		const citaMinutes = citaDate.getHours() * 60 + citaDate.getMinutes();

		// --- Verificar si la cita está dentro del turno ---
		let dentroTurno = false;
		for (const turno of vetAgenda) {
			if (turno.day.toLowerCase() !== citaDayName.toLowerCase()) continue;

			const [startH, startM] = turno.start.split(":").map(Number);
			const [endH, endM] = turno.end.split(":").map(Number);
			const startMinutes = startH * 60 + startM;
			const endMinutes = endH * 60 + endM;

			if (citaMinutes >= startMinutes && (citaMinutes + CITA_DURACION_MINUTOS) <= endMinutes) {
				dentroTurno = true;
				break;
			}
		}

		if (!dentroTurno) return alert("La cita no está dentro del horario disponible del veterinario.");

		// --- Verificar solapamiento con otras citas ---
		const citasVet = appointments.filter(a => a.veterinarianId === vetId);
		const nuevaInicio = citaDate.getTime();
		const nuevaFin = nuevaInicio + CITA_DURACION_MINUTOS * 60 * 1000;

		for (const cita of citasVet) {
			const citaExistenteInicio = new Date(cita.time).getTime();
			const citaExistenteFin = citaExistenteInicio + CITA_DURACION_MINUTOS * 60 * 1000;

			if (nuevaInicio < citaExistenteFin && nuevaFin > citaExistenteInicio) {
				return alert("Ya existe una cita para este veterinario en ese horario.");
			}
		}

		// --- Registrar cita ---
		const data = {
			id: Date.now(),
			clientName,
			petName,
			petType: "-",
			veterinarianId: vetId,
			veterinarian: veterinarios.find(v => v.id === vetId).name,
			time: fechaCita,
			reason: motivo,
			observaciones,
			statusId: 2, // Confirmada
			status: "Confirmada"
		};

		try {
			const response = await fetch(`${API_URL}/appointments`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data)
			});
			if (!response.ok) throw new Error("Error al registrar la cita");

			const nuevaCita = await response.json();
			appointments.push(nuevaCita);
			renderCitas();
			createNotification(`Nueva cita registrada para ${clientName}`);
			form.reset();
		} catch (error) {
			console.error(error);
			alert("No se pudo registrar la cita.");
		}
	});
}

// === Selector veterinario agenda ===
function initVeterinarioSelect() {
	const select = document.getElementById("veterinarioSelect");
	if (!select) return;

	select.addEventListener("change", () => {
		if (select.value) fetchAgenda(select.value);
		else document.getElementById("agendaBody").innerHTML = `<tr><td colspan="4">Seleccione un veterinario</td></tr>`;
	});
}

// === Sidebar / Mobile ===
function highlightActive() {
	const path = window.location.pathname;
	document.querySelectorAll(".sidebar-nav-item").forEach((a) => {
		const href = a.getAttribute("href");
		a.classList.toggle("sidebar-nav-item-active", href === path || (path === "/pages/citas_agendas" && href === "../pages/citas_agendas"));
	});
}

/*==================================================================*/
function initMobileMenu() {
	const mobileMenuBtn = document.getElementById("mobileMenuBtn");
	const sidebar = document.getElementById("sidebar");
	const overlay = document.getElementById("sidebarOverlay");

	if (mobileMenuBtn && sidebar) {
		mobileMenuBtn.addEventListener("click", () => {
			sidebar.classList.toggle("sidebar-open");
			if (overlay) overlay.classList.toggle("overlay-visible");
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
			if (overlay) overlay.classList.remove("overlay-visible");
		}
	});
}

// === Notificaciones dropdown ===
function initNotifications() {
	const btn = document.getElementById("notificationsBtn");
	const list = document.getElementById("notificationsList");
	if (!btn || !list) return;

	btn.addEventListener("click", () => list.classList.toggle("visible"));
	document.addEventListener("click", e => {
		if (!btn.contains(e.target) && !list.contains(e.target)) list.classList.remove("visible");
	});

	renderNotifications();
}

// === Lucide Icons ===
function initIcons() {
	if (typeof lucide !== 'undefined') lucide.createIcons();
}

// === Inicialización ===
document.addEventListener("DOMContentLoaded", async () => {
	highlightActive();
	initMobileMenu();
	initNotifications();
	initForm();
	initVeterinarioSelect();
	initIcons();

	await fetchVeterinarios();
	await fetchEstadosCita();
	await fetchCitas();
});
