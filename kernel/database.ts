import {
  HydycoModel,
  MongoosePlugin,
  MongooseRoutes,
} from "../packages/mongoose";

export default {
  plugin: MongoosePlugin,
  routesHandler: MongooseRoutes,
  model: HydycoModel,
  config: {
    connectionString: process.env.MONGO_CONNECTION,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
};
