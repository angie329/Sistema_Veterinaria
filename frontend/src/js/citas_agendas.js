// === Datos iniciales ===
let appointments = []; // Lista de citas
let notifications = []; // Lista de notificaciones

// Veterinarios de ejemplo
const veterinarios = [
  {
    id: 1,
    name: "Dr. Juan Pérez",
    agenda: [
      { day: "Lunes", start: "08:00", end: "12:00", shift: "Mañana" },
      { day: "Miércoles", start: "14:00", end: "18:00", shift: "Tarde" },
      { day: "Viernes", start: "08:00", end: "12:00", shift: "Mañana" },
    ],
  },
  {
    id: 2,
    name: "Dra. María González",
    agenda: [
      { day: "Martes", start: "09:00", end: "13:00", shift: "Mañana" },
      { day: "Jueves", start: "15:00", end: "19:00", shift: "Tarde" },
    ],
  },
];

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

  // Mostrar con animación
  setTimeout(() => notif.classList.add("show"), 10);

  // Ocultar después de 3 segundos
  setTimeout(() => {
    notif.classList.remove("show");
    setTimeout(() => notif.remove(), 300);
  }, 3000);
}

// === Render veterinarios en select ===
function renderVeterinarioSelects() {
  const selectAgenda = document.getElementById("veterinarioSelect");
  const selectCita = document.getElementById("veterinarioCitaSelect");
  if (!selectAgenda || !selectCita) return;

  // Limpiar opciones existentes
  selectAgenda.innerHTML = `<option value="">-- Seleccione --</option>`;
  selectCita.innerHTML = `<option value="">Seleccione veterinario</option>`;

  veterinarios.forEach((vet) => {
    const option1 = document.createElement("option");
    option1.value = vet.id.toString();
    option1.textContent = vet.name;
    selectAgenda.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = vet.id.toString();
    option2.textContent = vet.name;
    selectCita.appendChild(option2);
  });
}

// === Render de agenda ===
function renderAgenda(vetId) {
  const agendaBody = document.getElementById("agendaBody");
  if (!agendaBody) return;

  const vet = veterinarios.find((v) => v.id == vetId);
  if (!vet) {
    agendaBody.innerHTML = `<tr><td colspan="4">Seleccione un veterinario para ver su agenda</td></tr>`;
    return;
  }

  agendaBody.innerHTML = vet.agenda
    .map(
      (a) =>
        `<tr>
          <td>${a.day}</td>
          <td>${a.start}</td>
          <td>${a.end}</td>
          <td>${a.shift}</td>
        </tr>`
    )
    .join("");
}

// === Render de notificaciones ===
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
    .map(
      (n) => `<li class="notification-item">
        <span class="notification-message">${n.message}</span>
        <span class="notification-time">${formatTime(n.timestamp)}</span>
      </li>`
    )
    .join("");
}

// === Render de citas en la tabla ===
function renderCitas() {
  const citasBody = document.getElementById("citasBody");
  if (!citasBody) return;

  if (appointments.length === 0) {
    citasBody.innerHTML = `<tr><td colspan="6">No hay citas registradas</td></tr>`;
    return;
  }

  citasBody.innerHTML = appointments
    .map(
      (cita) => `
        <tr data-id="${cita.id}">
          <td>${cita.clientName}</td>
          <td>${cita.petName}</td>
          <td>${cita.veterinarian}</td>
          <td>${formatDateTime(cita.time)}</td>
          <td>${cita.reason}</td>
          <td>
            <button class="accion-btn edit" onclick="editAppointment(${cita.id})">Editar</button>
            <button class="accion-btn delete" onclick="deleteAppointment(${cita.id})">Eliminar</button>
          </td>
        </tr>`
    )
    .join("");
}

// === CRUD de citas ===
function addAppointment(appointment) {
  appointment.id = Date.now();
  appointments.push(appointment);
  renderCitas();
  createNotification(`Nueva cita registrada para ${appointment.clientName}`);
}

function deleteAppointment(id) {
  const cita = appointments.find((a) => a.id === id);
  if (!cita) return;
  
  appointments = appointments.filter((a) => a.id !== id);
  renderCitas();
  createNotification(`Cita de ${cita.clientName} eliminada`);
}

function editAppointment(id) {
  const appointment = appointments.find((a) => a.id === id);
  if (!appointment) return;

  const newDateTime = prompt("Nueva fecha y hora (formato: YYYY-MM-DDTHH:MM):", appointment.time);
  if (newDateTime && newDateTime !== appointment.time) {
    appointment.time = newDateTime;
    renderCitas();
    createNotification(`Cita de ${appointment.clientName} reagendada`);
  }
}

// Hacer las funciones globales para que funcionen con onclick
window.editAppointment = editAppointment;
window.deleteAppointment = deleteAppointment;

// === Formulario de registro ===
function initForm() {
  const form = document.getElementById("formCita");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const vetId = form.veterinarioCitaSelect.value;
    const vet = veterinarios.find(v => v.id == vetId);
    
    if (!vet) {
      alert("Por favor seleccione un veterinario");
      return;
    }

    const data = {
      time: form.fechaCitaInput.value,
      petName: form.mascotaInput.value,
      clientName: form.clienteInput.value,
      reason: form.motivoInput.value,
      veterinarian: vet.name,
      status: "pending",
    };
    
    addAppointment(data);
    form.reset();
  });
}

// === Eventos de selección de veterinario para agenda ===
function initVeterinarioSelect() {
  const select = document.getElementById("veterinarioSelect");
  if (!select) return;

  select.addEventListener("change", () => renderAgenda(select.value));
}

// === Sidebar y menú responsive ===
function highlightActive() {
  const currentPath = window.location.pathname;
  document.querySelectorAll(".sidebar-nav-item").forEach((a) => {
    const href = a.getAttribute("href");
    a.classList.toggle(
      "sidebar-nav-item-active",
      href === currentPath || (currentPath === "/index.html" && href === "/")
    );
  });
}

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

  document.addEventListener("click", (e) => {
    if (!btn.contains(e.target) && !list.contains(e.target)) {
      list.classList.remove("visible");
    }
  });

  renderNotifications();
}

// === Inicialización de Lucide Icons ===
function initIcons() {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// === Inicialización general ===
document.addEventListener("DOMContentLoaded", () => {
  renderVeterinarioSelects();
  initVeterinarioSelect();
  highlightActive();
  initMobileMenu();
  initNotifications();
  initForm();
  renderAgenda(veterinarios[0].id); // mostrar agenda inicial
  renderCitas();
  initIcons();
});