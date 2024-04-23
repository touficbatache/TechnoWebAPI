const {
  errorInternalError, okJson,
} = require("../utils/http_handlers");
const { Users } = require("../entities/users");
const { ValidationDemands } = require("../entities/validation_demands");

exports.ValidationDemandsController = class ValidationDemandsController {
  validationDemands;
  users;

  constructor(db) {
    this.validationDemands = new ValidationDemands(db);
    this.users = new Users(db);
  }

  async validationDemandGet(req, res) {
    try {
      const validationDemand = await this.validationDemands.get(req.params.validationDemandId);
      const user = await this.users.get(validationDemand.userId);
      delete validationDemand.userId;
      okJson(res, {
        ...validationDemand,
        userDetails: user,
      });
    } catch (e) {
      errorInternalError(res, "Internal Server Error", e.message);
    }
  }

  async validationDemandAccept(req, res) {
    try {
      const success = await this.validationDemands.accept(req.params.validationDemandId, Date.now());
      if (success) {
        okJson(res, { success });
      } else {
        errorInternalError(res, "Internal Server Error", "Could not delete validation demand");
      }
    } catch (e) {
      errorInternalError(res, "Internal Server Error", e.message);
    }
  }

  async validationDemandDelete(req, res) {
    try {
      const success = await this.validationDemands.delete(req.params.validationDemandId);
      if (success) {
        okJson(res, { success });
      } else {
        errorInternalError(res, "Internal Server Error", "Could not delete validation demand");
      }
    } catch (e) {
      errorInternalError(res, "Internal Server Error", e.message);
    }
  }

  async validationDemandsGetPending(req, res) {
    const validationDemands = await this.validationDemands.getPending();
    okJson(res, validationDemands);
  }
};
