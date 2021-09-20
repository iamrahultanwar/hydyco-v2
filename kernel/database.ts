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
    connectionString:
      "mongodb+srv://root:root@cluster0.lcb0z.mongodb.net/autoflipz?retryWrites=true&w=majority",
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
};
