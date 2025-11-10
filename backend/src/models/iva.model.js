import { createGenericModel } from "./base.model.js";
import { MODULE_IDS } from "../constants/modules.js";

const TABLE_NAME = "Gen_IVA";
const ID_FIELD = "Gen_id_iva";
const FIELDS = [
  { name: "Gen_modulo_origen", default: MODULE_IDS.MODULO_GENERAL },
  { name: "Gen_nombre", default: "" },
  { name: "Gen_porcentaje", default: 0 },
  { name: "Gen_fecha_vigencia_inicio", default: null },
  { name: "Gen_fecha_vigencia_fin", default: null },
  { name: "Gen_id_estado_general", default: 1 },
];

export const ivaModel = createGenericModel(TABLE_NAME, ID_FIELD, FIELDS);

export const getAllIVAs = ivaModel.getAll;
export const getIVAById = ivaModel.getById;
export const createIVA = ivaModel.create;
export const updateIVA = ivaModel.update;
export const deleteIVA = ivaModel.remove;
