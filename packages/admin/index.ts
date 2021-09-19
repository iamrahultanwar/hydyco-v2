import { Router } from "express";
import * as express from "express";
import * as path from "path";
const HydycoAdmin = Router();

HydycoAdmin.use("/img", express.static(path.join(__dirname, "public", "img")));
HydycoAdmin.use(
  "/static",
  express.static(path.join(__dirname, "public", "static"))
);
HydycoAdmin.use(
  "/manifest.json",
  express.static(path.join(__dirname, "public"))
);
HydycoAdmin.use("/style.css", express.static(path.join(__dirname, "public")));
HydycoAdmin.use("/admin-ui/*", express.static(path.join(__dirname, "public")));

HydycoAdmin.use("/admin-ui", (req, res) => res.redirect("/admin-ui/"));

export { HydycoAdmin };
