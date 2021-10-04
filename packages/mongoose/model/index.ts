/**
 * Parse json to mongoose schema object
 */
import { HydycoFile, HydycoParser } from "../../core";
import mongoose from "mongoose";
import { Schema, model, Model, Document } from "mongoose";

const { readMappingFile } = HydycoFile;
const { getFileName } = HydycoParser;

export default class HydycoModel {
  private _singleton: boolean = false;
  private _schema: Schema;

  constructor(private _fileName: string) {
    if (!_fileName) throw new Error("Model name is required");
    if (this._singleton) throw new Error("Class is already initialized");
    this._singleton = true;
    this._fileName = getFileName(_fileName);
    this._generateMongooseSchema();
  }

  /**
   * Mapping file data
   * @return {Object} - model raw json data
   */
  public mapping() {
    return this._getMapping();
  }

  /**
   * Schema raw json data
   * @return {Object} - schema raw json data
   */
  public schemaJson() {
    return this._getSchemaJson();
  }

  /**
   * Parsed schema | sanitized data
   * @return {Object} - parsed data
   */
  public schemaParsed() {
    return this._getSchemaParseData();
  }

  /**
   * Mongoose Schema
   * @return {Schema} mongoose schema
   */
  public Schema() {
    return this._schema;
  }

  /**
   * Update schema
   * @param schema
   * @returns this
   */
  public setSchema(schema: Schema) {
    this._schema = schema;
    this.updateMongooseModel();
    return this;
  }

  /**
   * Add any extra schema data - for example adding some extra property
   * @param {Object} schema
   */
  public updateSchema(schema: Object) {
    this._generateMongooseSchema(schema);
    this.updateMongooseModel();
  }

  public Model() {
    return this._getMongooseModel();
  }

  /**
   * Get mapping of model
   */
  private _getMapping() {
    return readMappingFile(this._fileName);
  }

  /**
   * Get Schema json from mapping file
   *
   */
  private _getSchemaJson() {
    const jsonData = readMappingFile(this._fileName);
    return jsonData["schema"];
  }

  /**
   * Get Schema json from mapping file
   *
   */
  private _getSchemaParseData() {
    let jsonData: any = this._getSchemaJson();
    jsonData = _sanitizeJsonData({
      ...jsonData,
      createdAt: {
        name: "createdAt",
        type: "date",
        default: "",
        index: false,
        maxLength: 0,
        minLength: 0,
        required: false,
        trim: false,
        unique: false,
        uppercase: false,
        lowercase: false,
        ref: "none",
        relationship: "hasmany",
        enum: [],
        autopopulate: true,
      },
      updatedAt: {
        name: "updatedAt",
        type: "date",
        default: "",
        index: false,
        maxLength: 0,
        minLength: 0,
        required: false,
        trim: false,
        unique: false,
        uppercase: false,
        lowercase: false,
        ref: "none",
        relationship: "hasmany",
        enum: [],
        autopopulate: true,
      },
    });
    jsonData = _parseTypeData(jsonData);
    return jsonData;
  }

  /**
   * Get Mongoose Schema
   */
  private _generateMongooseSchema(schemaData = {}) {
    const jsonData = this._getSchemaParseData();
    const schema = new Schema(Object.assign(jsonData, schemaData), {
      timestamps: true,
    });
    schema.plugin(mongooseAutoPopulatePlugin);
    this._schema = schema;
  }

  /**
   * Get Mongoose Model
   */
  private _getMongooseModel(): Model<Document<any, any>> {
    const modelName: any = getModelName(this._fileName);
    if (mongoose.models[modelName]) {
      return mongoose.models[modelName];
    }
    return model(modelName, this._schema);
  }

  /**
   * Update Mongoose model
   */
  public updateMongooseModel(): Model<Document<any, any>> {
    const modelName: any = getModelName(this._fileName);
    if (mongoose.models[modelName]) {
      delete mongoose.models[modelName];
    }
    return model(modelName, this._schema);
  }
}

/**
 * Remove unwanted data from json file
 * @param {Object} - Json data from json file
 * @return {Object} - sanitized json data
 */

const _sanitizeJsonData = (jsonData: any) => {
  Object.keys(jsonData).forEach((fieldKey) => {
    Object.keys(jsonData[fieldKey]).forEach((fieldDataKey) => {
      if (fieldDataKey !== "default") {
        if (
          typeof jsonData[fieldKey][fieldDataKey] === "boolean" &&
          jsonData[fieldKey][fieldDataKey] === false
        ) {
          delete jsonData[fieldKey][fieldDataKey];
        }
        if (
          typeof jsonData[fieldKey][fieldDataKey] == "string" &&
          jsonData[fieldKey][fieldDataKey].length === 0
        ) {
          delete jsonData[fieldKey][fieldDataKey];
        }

        if (
          typeof jsonData[fieldKey][fieldDataKey] == "number" &&
          jsonData[fieldKey][fieldDataKey] === 0
        ) {
          delete jsonData[fieldKey][fieldDataKey];
        }
        if (
          fieldDataKey === "enum" &&
          jsonData[fieldKey][fieldDataKey].length === 0
        ) {
          delete jsonData[fieldKey][fieldDataKey];
        }
        if (
          fieldDataKey === "ref" &&
          jsonData[fieldKey][fieldDataKey] === "none"
        ) {
          delete jsonData[fieldKey]["relationship"];
          delete jsonData[fieldKey]["ref"];
          delete jsonData[fieldKey]["autopopulate"];
        }
      }
      delete jsonData[fieldKey]["name"];
    });
  });
  return jsonData;
};

const _parseTypeData = (jsonData: any) => {
  const schemaJson: any = {};

  Object.keys(jsonData).forEach((fieldKey) => {
    const fieldData = jsonData[fieldKey];
    switch (jsonData[fieldKey]["type"]) {
      case "string":
        schemaJson[fieldKey] = {
          ...fieldData,
          type: _typeHandler("string"),
        };
        break;
      case "boolean":
        schemaJson[fieldKey] = {
          ...fieldData,
          type: _typeHandler("boolean"),
        };
        break;
      case "number":
        schemaJson[fieldKey] = {
          ...fieldData,
          type: _typeHandler("number"),
        };
        break;
      case "boolean":
        schemaJson[fieldKey] = {
          ...fieldData,
          type: _typeHandler("boolean"),
        };
        break;
      case "date":
        schemaJson[fieldKey] = {
          ...fieldData,
          type: _typeHandler("date"),
        };
        break;
      case "ref":
        schemaJson[fieldKey] = {
          ...fieldData,
          ref: getModelName(fieldData["ref"]),
          type:
            fieldData["relationship"] === "hasmany"
              ? [_typeHandler("ref")]
              : _typeHandler("ref"),
        };
        delete schemaJson[fieldKey]["relationship"];
        break;
      case "file":
        schemaJson[fieldKey] = {
          ...fieldData,
          ref: getModelName(fieldData["ref"]),
          type:
            fieldData["relationship"] === "hasmany"
              ? [_typeHandler("ref")]
              : _typeHandler("ref"),
        };
        delete schemaJson[fieldKey]["relationship"];
        break;
      case "json":
        schemaJson[fieldKey] = {
          ...fieldData,
          type: _typeHandler("json"),
        };
        break;
      case "richText":
        schemaJson[fieldKey] = {
          ...fieldData,
          type: _typeHandler("richText"),
        };
        break;
      default:
        throw new Error(
          `Unable to parse type data for ${jsonData[fieldKey]["type"]}`
        );
    }
  });

  return schemaJson;
};

const getModelName = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Returns mongoose type on the basis of json data type
 * @param {string} - Type from json file
 * @return {mongoose.Types}
 */

const _typeHandler = (type: string) => {
  switch (type) {
    case "string":
      return Schema.Types.String;
    case "boolean":
      return Schema.Types.Boolean;
    case "number":
      return Schema.Types.Number;
    case "date":
      return Schema.Types.Date;
    case "ref":
      return Schema.Types.ObjectId;
    case "json":
      return Schema.Types.Mixed;
    case "richText":
      return Schema.Types.Mixed;

    default:
      throw new Error(
        `Unable to determine data type of given argument : ${type}`
      );
  }
};

export const mongooseAutoPopulatePlugin = (schema) => {
  schema.plugin((schema) => {
    const populates = Object.keys(schema.obj).filter(
      (key: any) => schema.obj[key].autopopulate
    );
    // plugin to auto populate
    schema.pre("find", function () {
      this.populate(populates);
    });
    schema.pre("findOne", function () {
      this.populate(populates);
    });
    schema.pre("findById", function () {
      this.populate(populates);
    });
  });
};
