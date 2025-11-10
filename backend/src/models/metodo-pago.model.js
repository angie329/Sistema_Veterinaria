import { createGenericModel } from "./base.model.js";
import { MODULE_IDS } from "../constants/modules.js";

const TABLE_NAME = "Gen_MetodoPago";
const ID_FIELD = "Gen_id_metodo_pago";
const FIELDS = [
  { name: "Gen_modulo_origen", default: MODULE_IDS.MODULO_GENERAL },
  { name: "Gen_nombre", default: "" },
  { name: "Gen_descripcion", default: null },
  { name: "Gen_id_estado_general", default: 1 },
];

export const metodoPagoModel = createGenericModel(TABLE_NAME, ID_FIELD, FIELDS);

export const getAllMetodoPagos = metodoPagoModel.getAll;
export const getMetodoPagoById = metodoPagoModel.getById;
export const createMetodoPago = metodoPagoModel.create;
export const updateMetodoPago = metodoPagoModel.update;
export const deleteMetodoPago = metodoPagoModel.remove;
