import { RestApi } from "../packages/rest";
import UserRoutes from "../routes";

export default {
  baseUrl: "/api/v1",
  restModule: RestApi,
  overrides: {
    user: UserRoutes,
  },
  customRoutes: [],
};
