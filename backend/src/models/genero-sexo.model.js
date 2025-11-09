import { createGenericModel } from "./base.model.js";
import { MODULE_IDS } from "../constants/modules.js";

const TABLE_NAME = "Gen_GeneroSexo";
const ID_FIELD = "Gen_id_genero_sexo";
const FIELDS = [
  { name: "Gen_modulo_origen", default: MODULE_IDS.MODULO_GENERAL },
  { name: "Gen_nombre", default: "" },
  { name: "Gen_id_estado_general", default: 1 },
];

export const generoSexoModel = createGenericModel(TABLE_NAME, ID_FIELD, FIELDS);

export const getAllGeneroSexos = generoSexoModel.getAll;
export const getGeneroSexoById = generoSexoModel.getById;
export const createGeneroSexo = generoSexoModel.create;
export const updateGeneroSexo = generoSexoModel.update;
export const deleteGeneroSexo = generoSexoModel.remove;
