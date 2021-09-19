import { Router, Request, Response, IRouter } from "express";
import mongoose, { Schema } from "mongoose";
import Parser from "../model";
import { getMappingList, createMapping, deleteMapping } from "../mapping";
import { readAllMappingFiles } from "../../core/common/file";
import { getModelName } from "../../core/common/parser";
import { IConfig } from "../../core/types/config";
import chalk from "chalk";

const mquery = require("express-mquery"); // ts-types not found

const app = Router();

enum EOperations {
  read = "read",
  list = "list",
  create = "create",
  update = "update",
  delete = "delete",
  deleteAll = "deleteAll",
  ref = "ref",
}

interface ICurdData {
  id?: Schema.Types.ObjectId | Array<Schema.Types.ObjectId>;
  query: {
    pagination?: {
      current: number;
      pageSize: number;
    };
    find?: {};
    search?: string;
  };
  body?: {};
}

export interface ICurdBody {
  model: string;
  operations: EOperations;
  data: ICurdData;
}

/**
 * Function - Make Mongoose Data query using mquery parsed object
 * @param {Object} query - mquery parsed req object
 * @param {Object} Model - Mongoose Model
 * @return {Promise}
 */
export const HydycoQuery = (query: any, Model: any) => {
  if (query) {
    query = {
      filter: query.filter || {},
      paginate: query.paginate || { limit: 10, skip: 0, page: 1 },
      select: query.select || {},
      sort: query.sort || {},
    };
    return Model.find(query.filter)
      .select(query.select)
      .sort(query.sort)
      .limit(query.paginate.limit)
      .skip((query.paginate.page - 1) * query.paginate.limit);
  } else {
    return Model.find({});
  }
};

const generateRoutes = () => {
  /**
   * Get list of all registered mongoose models
   * @param {Request} request
   * @param {Response} response
   * @path /model/list
   * @method GET
   */
  app.get("/model/list", listModelsRoute);
  async function listModelsRoute(request: Request, response: Response) {
    const models = getMappingList();
    models.sort();
    return response.json(models);
  }

  /**
   * Get schema of mongoose model
   * @param {Request} request
   * @param {Response} response
   * @path /model/get/:modelName
   * @method GET
   */

  app.get("/model/get/:modelName", getModelRoute);
  async function getModelRoute(request: Request, response: Response) {
    const modelName = request.params?.modelName;

    if (modelName) {
      const model = {
        name: { type: String, default: "Rahul" },
      };

      return response.json(model);
    }
  }

  /**
   * Create mongoose model from json data
   * @param {Request} request
   * @param {Response} response
   * @path /model/create/:modelName
   * @method POST
   */

  app.post("/model/create/:modelName", createModelRoute);
  async function createModelRoute(request: Request, response: Response) {
    const modelName = request.params?.modelName;
    const body = request.body;
    try {
      if (modelName) {
        createMapping(modelName, body);
        readAllMappingFiles(true).forEach((file: any) => {
          new Parser(file).updateMongooseModel();
        });
        return response.json(body);
      }
    } catch (error) {
      console.log(error);
      return response.json(error).status(500);
    }
  }
  /**
   * Delete mongoose model from json data
   * @params {Request} request
   * @params {Response} response
   * @path /model/delete/:modelName
   * @method DELETE
   */

  app.delete("/model/delete/:modelName", deleteModelRoute);
  async function deleteModelRoute(request: Request, response: Response) {
    const modelName = request.params?.modelName;
    if (modelName) {
      try {
        deleteMapping(modelName);
        readAllMappingFiles(true).forEach((file: any) => {
          new Parser(file).updateMongooseModel();
        });
        return response.json({ status: true, message: "Collection Deleted" });
      } catch (error: any) {
        return response
          .json({ status: false, message: error.message })
          .status(500);
      }
    }
  }

  /**
   * CRUD dashboard data
   * @params {Request} request
   * @params {Response} response
   * @path /model/crud/
   * @method POST
   */
  app.post("/model/crud", mquery({ limit: 10 }), crud);
  async function crud(request: Request & { mquery?: any }, response: Response) {
    const body: ICurdBody = request.body;
    const Model = new Parser(getModelName(body.model));
    const operationModel = Model.Model();
    const operationSchema = Model.schemaParsed();
    const operationRaw: any = Model.schemaJson();

    try {
      switch (body.operations) {
        case EOperations.read:
          try {
            const data = await operationModel.findById(body.data.id).lean();
            return response.end(JSON.stringify({ ...data }));
          } catch (error) {
            console.log(error);
            return response.end(JSON.stringify({}));
          }
        case EOperations.list:
          const current = request.mquery?.paginate.page || 1;
          const pageSize = request.mquery?.paginate.limit || 10;

          const list = await HydycoQuery(request.mquery, operationModel);

          const column = Object.keys(operationSchema).map((key) => ({
            name: key,
            type: operationSchema[key].ref
              ? Array.isArray(operationSchema[key].type)
                ? "hasmany"
                : "hasone"
              : operationSchema[key].type.schemaName.toLowerCase(),
            file: operationSchema[key].ref === "File",
          }));
          const total = await operationModel
            .find(request.mquery.filter)
            .count();

          return response.end(
            JSON.stringify({
              list,
              pagination: {
                current: current,
                pageSize: pageSize,
                total,
              },
              column: [{ name: "_id", type: "objectId" }, ...column],
            })
          );
        case EOperations.create:
          const create = await operationModel.create(body.data.body);
          return response.end(JSON.stringify(create));
        case EOperations.update:
          const update = await operationModel.findByIdAndUpdate(
            body.data.id,
            body.data.body
          );
          return response.end(JSON.stringify(update));
        case EOperations.delete:
          const deleteO = await operationModel.findByIdAndDelete(
            body.data.id,
            body.data.body
          );
          return response.end(JSON.stringify(deleteO));
        case EOperations.deleteAll:
          const deleteAll = await operationModel.deleteMany({
            _id: body.data.id,
          });
          return response.end(JSON.stringify(deleteAll));
        case EOperations.ref:
          const or: any = [];
          const findRef: any = {};
          const searchValues: any = [];
          Object.keys(operationRaw).forEach((key: any) => {
            const find: any = {};
            if (operationRaw[key].type === "string") {
              searchValues.push(operationRaw[key].name);
              find[operationRaw[key].name] = {
                $regex: body.data.query?.search,
                $options: "i",
              };
              or.push(find);
            }
          });
          if (or.length) {
            findRef["$or"] = or;
          } else {
            searchValues.push("_id");
          }
          const refList = await operationModel.find(findRef).lean();
          return response.json({ list: refList, searchValues });
      }
    } catch (error: any) {
      return response
        .json({ status: false, message: error.message })
        .status(500);
    }
  }
  return app;
};

const connectDatabase = (connectionString: string, options: object) => {
  mongoose.connect(connectionString, {
    ...options,
  });

  mongoose.connection.on("connected", function () {
    console.log(chalk.greenBright("Database connected"));
  });

  mongoose.connection.on("error", function (err) {
    console.log(chalk.redBright("Database has  " + err + " error"));
  });

  mongoose.connection.on("disconnected", function () {
    console.log(chalk.cyanBright("Database disconnected"));
  });

  process.on("SIGINT", function () {
    mongoose.connection.close(function () {
      console.log(
        chalk.red(
          "Database connection is disconnected due to application termination"
        )
      );
      process.exit(0);
    });
  });
};

export interface IMongooseConfig {
  connectionString: string;
  options: {};
}

/**
 * Function - Config Mongoose to be used by Hydyco Core
 * @param {IMongooseConfig} config - Configuration object for mongoose
 * @return {IRouter} - express router that will be used by Hydyco core
 */

const MongoosePlugin = ({
  config,
  kernel,
}: {
  config: IConfig;
  kernel: any;
}) => {
  const authMiddleware = kernel.middleware.namedMiddleware?.authMiddleware;

  if (kernel.database.config.connectionString)
    connectDatabase(
      kernel.database.config.connectionString,
      kernel.database.config.options
    );
  if (authMiddleware) app.use(authMiddleware);
  return generateRoutes();
};

export default MongoosePlugin;
