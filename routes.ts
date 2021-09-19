import { RestApi } from "./packages/rest";

class UserRoutes extends RestApi {
  before(request, response, next) {
    next();
  }
}

export default UserRoutes;
