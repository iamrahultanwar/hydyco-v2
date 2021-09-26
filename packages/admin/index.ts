import express from "express";
import path from "path";
import { HydycoPlugin } from "../core/extends/plugin";

class HydycoAdmin extends HydycoPlugin {
  constructor() {
    super();
    this.registerRoutes();
  }

  private registerRoutes() {
    this.router.use(
      "/img",
      express.static(path.join(__dirname, "public", "img"))
    );
    this.router.use(
      "/static",
      express.static(path.join(__dirname, "public", "static"))
    );
    this.router.use(
      "/manifest.json",
      express.static(path.join(__dirname, "public"))
    );
    this.router.use(
      "/style.css",
      express.static(path.join(__dirname, "public"))
    );
    this.router.use(
      "/admin-ui/*",
      express.static(path.join(__dirname, "public"))
    );

    this.router.use("/admin-ui", (req, res) => res.redirect("/admin-ui/"));
  }

  public pluginRoutes() {
    return this.router;
  }
}

const AdminUI = new HydycoAdmin();

export { AdminUI };
