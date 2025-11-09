import { createGenericModel } from "./base.model.js";
import { MODULE_IDS } from "../constants/modules.js";

const TABLE_NAME = "Gen_Ciudad";
const ID_FIELD = "Gen_id_ciudad";
const FIELDS = [
  { name: "Gen_modulo_origen", default: MODULE_IDS.MODULO_GENERAL },
  { name: "Gen_nombre", default: "" },
  { name: "Gen_id_provincia", default: 1 },
  { name: "Gen_id_estado_general", default: 1 },
];

export const ciudadModel = createGenericModel(TABLE_NAME, ID_FIELD, FIELDS);

export const getAllCiudades = ciudadModel.getAll;
export const getCiudadById = ciudadModel.getById;
export const createCiudad = ciudadModel.create;
export const updateCiudad = ciudadModel.update;
export const deleteCiudad = ciudadModel.remove;

