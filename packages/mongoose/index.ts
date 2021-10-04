import HydycoModel from "./model";
import MongoosePlugin from "./plugin";
import MongooseRoutes from "./routes";
import { HydycoDatabase } from "../core/extends/database";

class HydycoMongoose extends HydycoDatabase {
  constructor() {
    super();
  }

  plugin() {
    return MongoosePlugin;
  }
  routesHandler() {
    return MongooseRoutes;
  }

  model() {
    return HydycoModel;
  }
}

export { HydycoModel, MongoosePlugin, MongooseRoutes, HydycoMongoose };
