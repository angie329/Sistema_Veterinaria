const TURNOS_URL = `${import.meta.env.VITE_BACKEND_URL}/v1/turnos`;

export async function verTurnos(idVeterinario, nombreVet) {
  try {
    const res = await fetch(`${TURNOS_URL}/${idVeterinario}`);
    if (!res.ok) throw new Error("Error al obtener turnos");
    const turnos = await res.json();

    const listaTurnos = turnos.length
      ? turnos.map(
          (t) => `
          <tr>
            <td>${t.Tur_Dia || "—"}</td>
            <td>${t.Tur_HoraInicio || "—"}</td>
            <td>${t.Tur_HoraFin || "—"}</td>
            <td>${t.Tur_Tipo || "—"}</td>
          </tr>`
        ).join("")
      : "<tr><td colspan='4'>Sin turnos registrados</td></tr>";

    document.getElementById("modalTitle").innerText = `Turnos de ${nombreVet}`;
    document.getElementById("modalBody").innerHTML = `
      <table class="tabla-turnos">
        <thead>
          <tr><th>Día</th><th>Inicio</th><th>Fin</th><th>Tipo</th></tr>
        </thead>
        <tbody>${listaTurnos}</tbody>
      </table>
    `;
    document.getElementById("modalTurnos").style.display = "block";
  } catch (error) {
    console.error("Error al cargar turnos:", error);
  }
}
export function cerrarModalTurnos() {
  const modal = document.getElementById("modalTurnos");
  modal.style.display = "none";
}
