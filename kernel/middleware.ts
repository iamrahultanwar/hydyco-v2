import { authMiddleware } from "../packages/auth";

export default {
  globalMiddleware: [],
  namedMiddleware: { authMiddleware },
};
