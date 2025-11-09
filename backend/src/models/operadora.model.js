import { createGenericModel } from "./base.model.js";
import { MODULE_IDS } from "../constants/modules.js";

const TABLE_NAME = "Gen_Operadora";
const ID_FIELD = "Gen_id_operadora";
const FIELDS = [
  { name: "Gen_modulo_origen", default: MODULE_IDS.MODULO_GENERAL },
  { name: "Gen_nombre", default: "" },
  { name: "Gen_id_estado_general", default: 1 },
];

export const operadoraModel = createGenericModel(
  TABLE_NAME,
  ID_FIELD,
  FIELDS
);

export const getAllOperadoras = operadoraModel.getAll;
export const getOperadoraById = operadoraModel.getById;
export const createOperadora = operadoraModel.create;
export const updateOperadora = operadoraModel.update;
export const deleteOperadora = operadoraModel.remove;

