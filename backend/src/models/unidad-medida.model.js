import { createGenericModel } from "./base.model.js";
import { MODULE_IDS } from "../constants/modules.js";

const TABLE_NAME = "Gen_UnidadMedida";
const ID_FIELD = "Gen_id_unidad_medida";
const FIELDS = [
  { name: "Gen_modulo_origen", default: MODULE_IDS.MODULO_GENERAL },
  { name: "Gen_codigo", default: "" },
  { name: "Gen_nombre", default: "" },
  { name: "Gen_tipo_unidad", default: null },
  { name: "Gen_id_estado_general", default: 1 },
];

export const unidadMedidaModel = createGenericModel(
  TABLE_NAME,
  ID_FIELD,
  FIELDS
);

export const getAllUnidadMedidas = unidadMedidaModel.getAll;
export const getUnidadMedidaById = unidadMedidaModel.getById;
export const createUnidadMedida = unidadMedidaModel.create;
export const updateUnidadMedida = unidadMedidaModel.update;
export const deleteUnidadMedida = unidadMedidaModel.remove;

