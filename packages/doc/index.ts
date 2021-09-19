import { Router, IRouter, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { readAllMappingFiles } from "../core/common/file";

const router: IRouter = Router();

/**
 * Util
 * @param {string} letter - any word
 * @return {string} - Capitalized Word
 */
const capitalizeFirstLetter = ([first, ...rest]) => {
  return first.toUpperCase() + rest;
};

/**
 * Swagger date type parser
 * @param {string} type
 * @return {string}
 */
const parseSwaggerTypes = (type: any) => {
  switch (type) {
    case "date":
      return Date;
    default:
      return type;
  }
};

export interface IDocsSchema {
  info: {
    description?: string;
    version?: string;
    title?: string;
  };
  host: string;
  basePath: string;
  tags: [];
  paths: {};
  definitions: {};
}

/**
 * Generate Swagger Doc Json
 * @param {IDocsSchema} - config data for swagger documentation
 * @return {IRouter} - express router
 */

const DocsPlugin = (
  config: IDocsSchema = {
    info: {},
    host: "localhost:3005",
    basePath: "/",
    tags: [],
    paths: {},
    definitions: {},
  }
): IRouter => {
  const docsParseSchema = (modelFiles) => {
    const docObject = {
      swagger: "2.0",
      info: {
        description: "This API docs is auto generated",
        version: "0.0.1",
        title: "Hydyco Docs",
        ...config.info,
      },
      tags: config.tags ? config.tags : [],
      schemes: ["http", "https"],
      paths: { ...config.paths },
      definitions: { ...config.definitions },
    };

    modelFiles.forEach((model: any) => {
      if (model.show) {
        const schemas = Object.values(model.schema);
        docObject.tags.push({ name: capitalizeFirstLetter(model.name) });
        docObject.paths[`/${model.name}`] = {
          get: {
            tags: [capitalizeFirstLetter(model.name)],
            summary: `Get list of all ${model.name}`,
            description: "Returns list of all data for the model " + model.name,
            consumes: ["application/json"],
            produces: ["application/json"],
            responses: {
              "200": {
                description: "successful operation",
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/definitions/" + capitalizeFirstLetter(model.name),
                  },
                },
              },
            },
          },
          post: {
            tags: [capitalizeFirstLetter(model.name)],
            summary: `Create entry for ${model.name}`,
            description: "Create new entry for " + model.name,
            consumes: ["application/json"],
            produces: ["application/json"],
            parameters: [
              {
                in: "body",
                name: "body",
                description: "",
                required: true,
                schema: {
                  $ref: "#/definitions/" + capitalizeFirstLetter(model.name),
                },
              },
            ],
            responses: {
              "200": {
                description: "successful operation",
                schema: {
                  $ref: "#/definitions/" + capitalizeFirstLetter(model.name),
                },
              },
            },
          },
          delete: {
            tags: [capitalizeFirstLetter(model.name)],
            summary: `Delete all data for ${model.name}`,
            description: "Delete all data for " + model.name,
            consumes: ["application/json"],
            produces: ["application/json"],
            responses: {
              "200": {
                description: "successful operation",
              },
            },
          },
        };
        docObject.paths[`/${model.name}/{id}`] = {
          get: {
            tags: [capitalizeFirstLetter(model.name)],
            summary: `Get list of all ${model.name}`,
            description: "Returns list of all data for the model " + model.name,
            consumes: ["application/json"],
            produces: ["application/json"],
            parameters: [
              {
                name: "id",
                in: "path",
                description: `ID of ${model.name} to get`,
                required: true,
                type: "string",
              },
            ],
            responses: {
              "200": {
                description: "successful operation",
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/definitions/" + capitalizeFirstLetter(model.name),
                  },
                },
              },
            },
          },
          put: {
            tags: [capitalizeFirstLetter(model.name)],
            summary: `Create entry for ${model.name}`,
            description: "Create new entry for " + model.name,
            consumes: ["application/json"],
            produces: ["application/json"],
            parameters: [
              {
                name: "id",
                in: "path",
                description: `ID of ${model.name} to update`,
                required: true,
                type: "string",
              },
              {
                in: "body",
                name: "body",
                description: "",
                required: true,
                schema: {
                  $ref: "#/definitions/" + capitalizeFirstLetter(model.name),
                },
              },
            ],
            responses: {
              "200": {
                description: "successful operation",
                schema: {
                  $ref: "#/definitions/" + capitalizeFirstLetter(model.name),
                },
              },
            },
          },
          delete: {
            tags: [capitalizeFirstLetter(model.name)],
            summary: `Delete all data for ${model.name}`,
            description: "Delete all data for " + model.name,
            consumes: ["application/json"],
            produces: ["application/json"],
            parameters: [
              {
                name: "id",
                in: "path",
                description: `ID of ${model.name} to delete data `,
                required: true,
                type: "string",
              },
            ],
            responses: {
              "200": {
                description: "successful operation",
              },
            },
          },
        };

        if (!model.operations.list)
          delete docObject.paths[`/${model.name}`].get;
        if (!model.operations.create)
          delete docObject.paths[`/${model.name}`].post;
        if (!model.operations.delete)
          delete docObject.paths[`/${model.name}`].delete;

        if (!model.operations.read)
          delete docObject.paths[`/${model.name}/{id}`].read;
        if (!model.operations.update)
          delete docObject.paths[`/${model.name}/{id}`].update;
        if (!model.operations.deleteAll)
          delete docObject.paths[`/${model.name}/{id}`].deleteAll;

        docObject.definitions[capitalizeFirstLetter(model.name)] = {
          type: "object",
          properties: schemas.reduce((prev: any, curr: any) => {
            return {
              ...prev,
              [curr.name]:
                curr.type === "ref"
                  ? curr.relationship === "hasmany"
                    ? {
                        type: "array",
                        items: {
                          $ref:
                            "#/definitions/" + capitalizeFirstLetter(curr.ref),
                        },
                      }
                    : {
                        $ref:
                          "#/definitions/" + capitalizeFirstLetter(curr.ref),
                      }
                  : {
                      type: parseSwaggerTypes(curr.type),
                    },
            };
          }, {}),
        };
      }
    });

    return docObject;
  };

  // register swagger ui
  router.use("/api-docs", swaggerUi.serve);

  // config swagger
  router.get(
    "/api-docs",
    swaggerUi.setup(null, {
      swaggerOptions: {
        url: "/admin/api-json",
      },
    })
  );

  router.get("/api-json", (request: Request, response: Response) => {
    const modelFiles = readAllMappingFiles();
    return response.json(docsParseSchema(modelFiles));
  });

  return router;
};

export { DocsPlugin };
