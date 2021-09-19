/**
 * Plugins are meant to be used as express middleware
 * you can have your custom plugins and integrate with hydyco
 * module - express router , can be function which returns express router
 * config - you can pass some config , you need have function for that
 * invoke - pass on true if you want to invoke the function
 * serverPath - you can have custom path defined here you want
 */
import { AuthPlugin } from "../packages/auth";
import { HydycoAdmin } from "../packages/admin";
import { FilePlugin } from "../packages/file";
import { DocsPlugin } from "../packages/doc";
import { EmailPlugin } from "../packages/email";
import Welcome from "../welcome";

export default [
  {
    module: AuthPlugin,
    config: {
      secretOrKey: "random",
      expiresIn: 30000,
    },
    invoke: true,
  },
  { module: HydycoAdmin },
  {
    module: FilePlugin,
    config: { uploadDir: "uploads" },
    serverPath: "/admin",
    invoke: true,
  },
  { module: DocsPlugin, serverPath: "/admin", invoke: true },
  {
    module: EmailPlugin,
    config: {
      port: 1025,
      tls: {
        rejectUnauthorized: false,
      },
    },
    serverPath: "/admin",
    invoke: true,
  },
  { module: Welcome, serverPath: "/" },
];
