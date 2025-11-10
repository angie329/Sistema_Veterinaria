import { createGenericModel } from "./base.model.js";
import { MODULE_IDS } from "../constants/modules.js";

const TABLE_NAME = "Gen_Provincia";
const ID_FIELD = "Gen_id_provincia";
const FIELDS = [
  { name: "Gen_modulo_origen", default: MODULE_IDS.MODULO_GENERAL },
  { name: "Gen_nombre", default: "" },
  { name: "Gen_codigo_pais", default: "EC" },
  { name: "Gen_id_estado_general", default: 1 },
];

export const provinciaModel = createGenericModel(
  TABLE_NAME,
  ID_FIELD,
  FIELDS
);

export const getAllProvincias = provinciaModel.getAll;
export const getProvinciaById = provinciaModel.getById;
export const createProvincia = provinciaModel.create;
export const updateProvincia = provinciaModel.update;
export const deleteProvincia = provinciaModel.remove;

