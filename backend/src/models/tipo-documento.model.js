import { createGenericModel } from "./base.model.js";
import { MODULE_IDS } from "../constants/modules.js";

const TABLE_NAME = "Gen_TipoDocumento";
const ID_FIELD = "Gen_id_tipo_documento";
const FIELDS = [
  { name: "Gen_modulo_origen", default: MODULE_IDS.MODULO_GENERAL },
  { name: "Gen_codigo", default: "" },
  { name: "Gen_nombre", default: "" },
  { name: "Gen_descripcion", default: null },
  { name: "Gen_id_estado_general", default: 1 },
];

export const tipoDocumentoModel = createGenericModel(
  TABLE_NAME,
  ID_FIELD,
  FIELDS
);

export const getAllTipoDocumentos = tipoDocumentoModel.getAll;
export const getTipoDocumentoById = tipoDocumentoModel.getById;
export const createTipoDocumento = tipoDocumentoModel.create;
export const updateTipoDocumento = tipoDocumentoModel.update;
export const deleteTipoDocumento = tipoDocumentoModel.remove;

