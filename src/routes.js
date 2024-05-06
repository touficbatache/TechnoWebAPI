const express = require("express");
const { UserController } = require("./controllers/users_controller");
const { AuthHandler } = require("./utils/auth_handler");
const { AuthController } = require("./controllers/auth_controller");
const { ValidationDemandsController } = require("./controllers/validation_demands_controller");
const { MessagesController } = require("./controllers/messages_controller");

function init(db) {
  const router = express.Router();
  router.use(express.json());
  router.use((req, res, next) => {
    console.log(
      "Express API: user: %s, method: %s, path: %s, body:",
      req.session.userid,
      req.method,
      req.path,
      req.body,
    );
    next();
  });

  const authHandler = new AuthHandler();

  // ------- Users service -------

  const userController = new UserController(db);

  router.put("/user", (...args) => userController.userCreate(...args));

  router.get(
    "/user/:user_id",
    (...args) => authHandler.authorizeAuthenticated(...args),
    (...args) => userController.userGet(...args),
  );

  router.delete(
    "/user/:user_id",
    (...args) => authHandler.authorizeAuthenticated(...args),
    (...args) => userController.userDelete(...args),
  );

  router.get(
    "/users",
    (...args) => authHandler.authorizeAuthenticated(...args),
    (...args) => userController.usersGet(...args),
  );

  // ------- Auth service -------

  const authController = new AuthController(db);

  router.put("/auth", (...args) => authController.authLogin(...args));

  router.delete("/auth", (...args) => authController.authLogout(...args));

  // ------- Validation demands service -------

  const validationDemandsController = new ValidationDemandsController(db);

  router.get(
    "/demand/:validationDemandId",
    (...args) => authHandler.authorizeAdmin(...args),
    (...args) => validationDemandsController.validationDemandGet(...args),
  );

  router.post(
    "/demand/:validationDemandId",
    (...args) => authHandler.authorizeAdmin(...args),
    (...args) => validationDemandsController.validationDemandAccept(...args),
  );

  router.delete(
    "/demand/:validationDemandId",
    (...args) => authHandler.authorizeAdmin(...args),
    (...args) => validationDemandsController.validationDemandDelete(...args),
  );

  router.get(
    "/demands",
    (...args) => authHandler.authorizeAdmin(...args),
    (...args) => validationDemandsController.validationDemandsGetPending(...args),
  );

  // ------- Messages service -------

  const messagesController = new MessagesController(db);

  router.put(
    "/message",
    (...args) => authHandler.authorizeAuthenticated(...args),
    (...args) => messagesController.messageCreate(...args),
  );

  router.get(
    "/messages/public",
    (...args) => authHandler.authorizeAuthenticated(...args),
    (...args) => messagesController.messagesGetAllPublic(...args),
  );

  router.get(
    "/messages/private",
    (...args) => authHandler.authorizeAdmin(...args),
    (...args) => messagesController.messagesGetAllPrivate(...args),
  );

  router.post(
    "/messages/search",
    (...args) => authHandler.authorizeAuthenticated(...args),
    (...args) => messagesController.messagesSearch(...args),
  );

  router.get(
    "/message/:messageId",
    (...args) => authHandler.authorizeAuthenticated(...args),
    (...args) => messagesController.messageGet(...args),
  );

  router.delete(
    "/message/:messageId",
    (...args) => authHandler.authorizeAuthenticated(...args),
    (...args) => messagesController.messageDelete(...args),
  );

  return router;
}

exports.default = init;
