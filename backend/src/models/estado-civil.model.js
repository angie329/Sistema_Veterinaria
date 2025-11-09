import { createGenericModel } from "./base.model.js";
import { MODULE_IDS } from "../constants/modules.js";

const TABLE_NAME = "Gen_EstadoCivil";
const ID_FIELD = "Gen_id_estado_civil";
const FIELDS = [
  { name: "Gen_modulo_origen", default: MODULE_IDS.MODULO_GENERAL },
  { name: "Gen_nombre", default: "" },
  { name: "Gen_id_estado_general", default: 1 },
];

export const estadoCivilModel = createGenericModel(
  TABLE_NAME,
  ID_FIELD,
  FIELDS
);

export const getAllEstadoCiviles = estadoCivilModel.getAll;
export const getEstadoCivilById = estadoCivilModel.getById;
export const createEstadoCivil = estadoCivilModel.create;
export const updateEstadoCivil = estadoCivilModel.update;
export const deleteEstadoCivil = estadoCivilModel.remove;
