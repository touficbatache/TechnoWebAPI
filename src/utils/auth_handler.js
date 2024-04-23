const { errorUnauthorized } = require("./http_handlers");

exports.AuthHandler = class AuthHandler {
  authorizeAdmin = async (req, res, next) => {
    if (req.session?.user && req.session.user.role === "admin") {
      next();
    } else {
      errorUnauthorized(res);
    }
  };

  authorizeAuthenticated = async (req, res, next) => {
    if (req.session?.userid) {
      next();
    } else {
      errorUnauthorized(res);
    }
  };
};
