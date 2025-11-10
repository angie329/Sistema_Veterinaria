import { createGenericModel } from "./base.model.js";
import { MODULE_IDS } from "../constants/modules.js";

const TABLE_NAME = "Gen_EstadoGeneral";
const ID_FIELD = "Gen_id_estado_general";
const FIELDS = [
  { name: "Gen_modulo_origen", default: MODULE_IDS.MODULO_GENERAL },
  { name: "Gen_nombre", default: "" },
  { name: "Gen_es_activo", default: true },
  { name: "Gen_descripcion", default: null },
];

export const estadoGeneralModel = createGenericModel(
  TABLE_NAME,
  ID_FIELD,
  FIELDS
);

export const getAllEstadoGeneral = estadoGeneralModel.getAll;
export const getEstadoGeneralById = estadoGeneralModel.getById;
export const createEstadoGeneral = estadoGeneralModel.create;
export const updateEstadoGeneral = estadoGeneralModel.update;
export const deleteEstadoGeneral = estadoGeneralModel.remove;

