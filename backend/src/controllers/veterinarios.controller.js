import {
  getAllVeterinarios,
  createVeterinario,
  deleteVeterinario,
  updateVeterinario,
} from "../models/veterinario.model.js";

export const obtenerVeterinarios = async (req, res) => {
  const data = await getAllVeterinarios();
  res.json(data);
};

export const agregarVeterinario = async (req, res) => {
  try {
    await createVeterinario(req.body);
    res.status(201).json({ mensaje: "Veterinario agregado correctamente" });
  } catch (error) {
    console.error(" Error al insertar veterinario:", error);
    res.status(500).json({ error: "Error al insertar veterinario" });
  }
};

export const eliminarVeterinario = async (req, res) => {
  const { id } = req.params;
  await deleteVeterinario(id);
  res.json({ mensaje: "Veterinario eliminado correctamente" });
};

export const editarVeterinario = async (req, res) => {
  const { id } = req.params;
  const {
    Vet_Nombres,
    Vet_Apellidos,
    Vet_Correo,
    Vet_Telefono,
    EspecialidadNombre,
  } = req.body;

  try {
    await updateVeterinario(id, {
      Vet_Nombres,
      Vet_Apellidos,
      Vet_Correo,
      Vet_Telefono,
      EspecialidadNombre,
    });

    res.json({ mensaje: "Veterinario actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar veterinario:", error);
    res.status(500).json({ error: "Error al actualizar veterinario" });
  }
};
