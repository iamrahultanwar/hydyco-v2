import { Router } from "express";

class HydycoPlugin {
  admin: boolean;
  router: Router;
  constructor() {
    this.router = Router();
  }

  public pluginRoutes(): Router {
    return this.router;
  }
}

export { HydycoPlugin };
