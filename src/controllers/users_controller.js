const {
  errorInternalError, errorNotFound, okJson, createdJson, errorBadRequest, errorUnauthorized,
} = require("../utils/http_handlers");
const { Users } = require("../entities/users");
const { ValidationDemands } = require("../entities/validation_demands");

exports.UserController = class UserController {
  users;
  validationDemands;

  constructor(db) {
    this.users = new Users(db);
    this.validationDemands = new ValidationDemands(db);
  }

  async userCreate(req, res) {
    const { login, password, lastname, firstname } = req.body;
    if (!login || !password || !lastname || !firstname) {
      errorBadRequest(res, "Bad Request", "Missing fields");
    } else {
      try {
        const userId = await this.users.create(login, password, lastname, firstname);
        await this.validationDemands.create(userId.toString(), Date.now());
        createdJson(res, { id: userId });
      } catch (e) {
        errorInternalError(res, "Internal Server Error", e.message);
      }
    }
  }

  async userGet(req, res) {
    try {
      const user = await this.users.get(req.params.user_id);
      if (!user) errorNotFound(res); else okJson(res, user);
    } catch (e) {
      errorInternalError(res, "Internal Server Error", e.message);
    }
  }

  async usersGet(req, res) {
    const users = await this.users.getAll();
    okJson(res, users);
  }

  async userDelete(req, res) {
    try {
      if (req.session.user.role === "admin" || req.session.user._id.toString() === req.params.user_id) {
        const success = await this.users.delete(req.params.user_id);
        if (success) {
          okJson(res, { success });
        } else {
          errorInternalError(res, "Internal Server Error", "Could not delete user");
        }
      } else {
        errorUnauthorized(res);
      }
    } catch (e) {
      errorInternalError(res, "Internal Server Error", e.message);
    }
  }
};
