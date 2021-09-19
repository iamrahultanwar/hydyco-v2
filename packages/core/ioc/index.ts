import {
  asValue,
  asClass,
  InjectionMode,
  createContainer,
  listModules,
} from "awilix";

import EventEmitter from "events";
import { HydycoServer } from "../server";
import { JobQueue } from "../../job";
import { checkHydyco } from "../common/path";
import { readObject, reduceIOCArray } from "../utils/ioc";

checkHydyco();

const kernelModules = listModules(["kernel/*"]);
const configModules = listModules(["config/*"]);

// Create the container and set the injectionMode to PROXY (which is also the default).
const HydycoContainer = createContainer({
  injectionMode: InjectionMode.PROXY,
});

// init
HydycoContainer.register({
  event: asClass(EventEmitter),
  config: asValue(reduceIOCArray(configModules)),
  kernel: asValue(reduceIOCArray(kernelModules)),
  server: asClass(HydycoServer),
});

// boot and register database
const registeredDatabase: any = readObject(
  HydycoContainer.resolve("kernel"),
  "database.plugin"
);

HydycoContainer.register("database", asClass(registeredDatabase));
HydycoContainer.register("job", asClass(JobQueue));

export const getConfig = (path: string | undefined) => {
  const config = HydycoContainer.resolve("config");
  return path ? readObject(config, path) : config;
};

export const middleware = (name: string | Array<string>) => {
  const namedMiddleware: any = readObject(
    HydycoContainer.resolve("kernel"),
    "middleware.namedMiddleware"
  );
  if (typeof name === "string") {
    return namedMiddleware[name];
  } else if (Array.isArray(name)) {
    return namedMiddleware.reduce((prev, curr) => {
      const m = namedMiddleware[curr];
      return [...prev, m];
    }, []);
  }
  return;
};

export const job: JobQueue = HydycoContainer.resolve("job");

export const event: EventEmitter = HydycoContainer.resolve("event");

export const server: HydycoServer = HydycoContainer.resolve("server");
