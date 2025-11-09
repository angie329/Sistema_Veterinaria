import { createIcons, icons } from "lucide";



function highlightActive() {
  const currentPath = window.location.pathname;
  document.querySelectorAll(".sidebar-nav-item").forEach((a) => {
    const href = a.getAttribute("href");
    a.classList.toggle(
      "sidebar-nav-item-active",
      href === currentPath ||
        (currentPath === "/clients.html" && href === "/clients")
    );
  });
}

createIcons({
  icons: {
    LayoutDashboard: icons.LayoutDashboard,
    Users: icons.Users,
    Dog: icons.Dog,
    Stethoscope: icons.Stethoscope,
    Calendar: icons.Calendar,
    Package: icons.Package,
    Receipt: icons.Receipt,
    Settings: icons.Settings,
    Search: icons.Search,
    Bell: icons.Bell,
    ChevronDown: icons.ChevronDown,
    PlusCircle: icons.PlusCircle,
    Menu: icons.Menu,
    Table: icons.Table,
    UserPlus: icons.UserPlus,
  },
});

function initMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const sidebar = document.getElementById("sidebar");
  const overlay =
    document.getElementById("sidebarOverlay") ||
    document.querySelector(".sidebar-overlay");

  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener("click", () => {
      sidebar.classList.toggle("sidebar-open");
      if (overlay) {
        overlay.classList.toggle("overlay-visible");
      }
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
      if (overlay) {
        overlay.classList.remove("overlay-visible");
      }
    }
  });
}

function initDashboard() {
  highlightActive();
  initMobileMenu();
}

const API_URL = "http://localhost:3008/v1/api/clientes";

async function cargarClientes() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Error al obtener clientes");

    const clientes = await response.json();
    const tbody = document.getElementById("clientes-body");

    if (!tbody) return; // evita errores si no estás en la página de clientes

    tbody.innerHTML = "";

    clientes.forEach((cliente) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${cliente.id_Clientes}</td>
        <td>${cliente.Cli_Identificacion}</td>
        <td>${cliente.Cli_Nombres}</td>
        <td>${cliente.Cli_Apellidos || ""}</td>
        <td>${cliente.Cli_Telefono}</td>
        <td>${cliente.Cli_Email}</td>
        <td>${cliente.Cli_DireccionDetalle}</td>
        <td>${new Date(cliente.Cli_FechaRegistro).toLocaleDateString("es-EC")}</td>
        <td>
          <button class="btn-editar" data-id="${cliente.id_Clientes}">✏️</button>
          <button class="btn-eliminar" data-id="${cliente.id_Clientes}">🗑️</button>
        </td>
      `;
      tbody.appendChild(fila);
    });

    // Asignar eventos a los botones después de renderizar
    document.querySelectorAll(".btn-eliminar").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.target.dataset.id;
        eliminarCliente(id);
      });
    });

    document.querySelectorAll(".btn-editar").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.target.dataset.id;
        const cliente = clientes.find((c) => c.id_Clientes == id);
        llenarFormulario(cliente);
      });
    });

  } catch (error) {
    console.error("Error cargando clientes:", error);
  }

}

async function crearCliente(cliente) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente),
  });
  if (!response.ok) throw new Error("Error al crear cliente");
  return response.json();
}

// Actualizar cliente (PUT)
async function actualizarCliente(id, cliente) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente),
  });
  if (!response.ok) throw new Error("Error al actualizar cliente");
  return response.json();
}

// Eliminar cliente (DELETE lógico)
async function eliminarCliente(id) {
  if (!confirm("¿Seguro que deseas eliminar este cliente?")) return;
  const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Error al eliminar cliente");
  alert("Cliente eliminado correctamente");
  cargarClientes();
}


function llenarFormulario(cliente) {
  document.getElementById("cliente-id").value = cliente.id_Clientes;
  document.getElementById("Cli_Identificacion").value = cliente.Cli_Identificacion;
  document.getElementById("Cli_Nombres").value = cliente.Cli_Nombres;
  document.getElementById("Cli_Apellidos").value = cliente.Cli_Apellidos;
  document.getElementById("Cli_Telefono").value = cliente.Cli_Telefono;
  document.getElementById("Cli_Email").value = cliente.Cli_Email;
  document.getElementById("Cli_DireccionDetalle").value = cliente.Cli_DireccionDetalle;
}

document.getElementById("cliente-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("cliente-id").value;

  const nuevoCliente = {
    Cli_Identificacion: document.getElementById("Cli_Identificacion").value,
    Cli_Nombres: document.getElementById("Cli_Nombres").value,
    Cli_Apellidos: document.getElementById("Cli_Apellidos").value,
    Cli_Telefono: document.getElementById("Cli_Telefono").value,
    Cli_Email: document.getElementById("Cli_Email").value,
    Cli_DireccionDetalle: document.getElementById("Cli_DireccionDetalle").value,
  };

  try {
    if (id) {
      await actualizarCliente(id, nuevoCliente);
      alert("Cliente actualizado correctamente");
    } else {
      await crearCliente(nuevoCliente);
      alert("Cliente agregado correctamente");
    }
    e.target.reset();
    document.getElementById("cliente-id").value = "";
    cargarClientes();
  } catch (error) {
    alert("Error al guardar cliente");
    console.error(error);
  }
});


console.log("✅ clients.js cargado correctamente");

document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Ejecutando cargarClientes()");
  cargarClientes();
});


// Ejecutar automáticamente cuando se cargue la página
document.addEventListener("DOMContentLoaded", cargarClientes);