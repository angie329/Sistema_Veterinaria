const ESPECIALIDADES_URL = `${import.meta.env.VITE_BACKEND_URL}/v1/especialidades`;

export function cargarEspecialidades(selectId, selectedNombre = null) {
  const select = document.getElementById(selectId);

  const opciones = ["Animal", "Enfermedad"];

  select.innerHTML = opciones
    .map(
      (nombre) => `
        <option value="${nombre}" ${
          nombre === selectedNombre ? "selected" : ""
        }>${nombre}</option>
      `
    )
    .join("");
}

