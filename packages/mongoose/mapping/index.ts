import { HydycoParser, HydycoFile } from "../../core";
import mongoose from "mongoose";

const { getFileName } = HydycoParser;
const { writeMappingFile, readAllMappingFiles, deleteMappingFile } = HydycoFile;

/**
 * Create mapping from json data
 * @param {string} mappingName
 * @param {map} jsonData
 *
 */
export const createMapping = (mappingName: string, jsonData: {}) => {
  mappingName = getFileName(mappingName);
  writeMappingFile(mappingName, jsonData);
  if (mongoose.model[mappingName]) delete mongoose.model[mappingName];
};

/**
 * Get all mapping list
 */
export const getMappingList = () => {
  const mappingNames = readAllMappingFiles();
  return mappingNames;
};

/**
 * Delete mapping
 * @param {string} mappingName
 */
export const deleteMapping = (mappingName: string) => {
  mappingName = getFileName(mappingName);
  deleteMappingFile(mappingName);
  if (mongoose.model[mappingName]) delete mongoose.model[mappingName];
};
