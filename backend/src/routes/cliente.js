// src/routes/clients.js
import { Router } from "express";
import { query } from "../config/database.js";

const clientsRoutes = Router();

/* Obtener todos los clientes activos */
clientsRoutes.get("/", async (req, res) => {
  try {
    const sql = `
      SELECT 
        id_Clientes,
        Cli_Identificacion,
        Cli_Nombres,
        Cli_Apellidos,
        Cli_Telefono,
        Cli_Email,
        Cli_DireccionDetalle,
        Cli_FechaRegistro,
        Cli_Estado
      FROM clientes
      WHERE Cli_Estado = 1
      ORDER BY Cli_FechaRegistro DESC
    `;
    const rows = await query(sql);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ error: "Error al obtener los clientes" });
  }
});

/* Registrar un nuevo cliente (seguro contra undefined) */
clientsRoutes.post("/", async (req, res) => {
  try {
    const {
      id_ModuloGeneral_Fk,
      id_TipoDocumento_Fk,
      id_GeneroSexo_Fk,
      id_Operadora_Fk,
      id_Provincia_Fk,
      id_Ciudad_Fk,
      Cli_Identificacion,
      Cli_Nombres,
      Cli_Apellidos,
      Cli_Telefono,
      Cli_Email,
      Cli_DireccionDetalle,
    } = req.body;

    const params = [
      id_ModuloGeneral_Fk ?? null,
      id_TipoDocumento_Fk ?? null,
      id_GeneroSexo_Fk ?? null,
      id_Operadora_Fk ?? null,
      id_Provincia_Fk ?? null,
      id_Ciudad_Fk ?? null,
      Cli_Identificacion ?? null,
      Cli_Nombres ?? null,
      Cli_Apellidos ?? null,
      Cli_Telefono ?? null,
      Cli_Email ?? null,
      Cli_DireccionDetalle ?? null,
    ];

    const sql = `
      INSERT INTO clientes (
        id_ModuloGeneral_Fk,
        id_TipoDocumento_Fk,
        id_GeneroSexo_Fk,
        id_Operadora_Fk,
        id_Provincia_Fk,
        id_Ciudad_Fk,
        Cli_Identificacion,
        Cli_Nombres,
        Cli_Apellidos,
        Cli_Telefono,
        Cli_Email,
        Cli_DireccionDetalle
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, params);
    res.status(201).json({ id: result.insertId, mensaje: "Cliente agregado correctamente" });
  } catch (error) {
    console.error("Error al agregar cliente:", error);
    res.status(500).json({ error: "Error al agregar cliente" });
  }
});

/* Actualizar cliente (seguro contra undefined) */
clientsRoutes.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      Cli_Nombres,
      Cli_Apellidos,
      Cli_Telefono,
      Cli_Email,
      Cli_DireccionDetalle,
      Cli_Estado,
    } = req.body;

    const params = [
      Cli_Nombres ?? null,
      Cli_Apellidos ?? null,
      Cli_Telefono ?? null,
      Cli_Email ?? null,
      Cli_DireccionDetalle ?? null,
      Cli_Estado ?? 1,
      id,
    ];

    const sql = `
      UPDATE clientes
      SET
        Cli_Nombres = ?,
        Cli_Apellidos = ?,
        Cli_Telefono = ?,
        Cli_Email = ?,
        Cli_DireccionDetalle = ?,
        Cli_Estado = ?
      WHERE id_Clientes = ?
    `;

    const result = await query(sql, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json({ mensaje: "Cliente actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
});

/* Desactivar cliente (borrado lógico) */
clientsRoutes.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sql = "UPDATE clientes SET Cli_Estado = 0 WHERE id_Clientes = ?";
    const result = await query(sql, [id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Cliente no encontrado" });
    res.json({ mensaje: "Cliente desactivado correctamente" });
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    res.status(500).json({ error: "Error al eliminar cliente" });
  }
});

clientsRoutes.get("/:id/mascotas", async (req, res) => {
    try {
        const clienteId = req.params.id;
        const sql = `
            SELECT mas_id_mascota, mas_nombre, mas_id_tipo_mascota_fk
            FROM mas_mascota
            WHERE mas_id_cliente_fk = ?
        `;
        const rows = await query(sql, [clienteId]);
        res.json(rows);  // Devuelve un array JSON de mascotas
    } catch (error) {
        console.error("Error al obtener mascotas:", error);
        res.status(500).json({ error: "Error al obtener las mascotas" });
    }
});

export default clientsRoutes;