const {
  errorBadRequest, errorUnauthorized, errorInternalError, okJson, errorForbidden,
} = require("../utils/http_handlers");
const { Users } = require("../entities/users");

exports.AuthController = class AuthController {
  users;

  constructor(db) {
    this.users = new Users(db);
  }

  async authLogin(req, res) {
    try {
      const { login, password } = req.body;
      // Erreur sur la requête HTTP
      if (!login || !password) {
        errorBadRequest(res, "Missing login and password fields");
        return;
      }
      if (!await this.users.exists(login)) {
        errorUnauthorized(res, "Invalid login");
        return;
      }
      let user = await this.users.checkpassword(login, password);
      if (user != null) {
        if (user.role === "admin" || user.validated) {
          // Avec middleware express-session
          req.session.regenerate((err) => {
            if (err) {
              errorInternalError(res);
            } else {
              // C'est bon, nouvelle session créée
              req.session.userid = user._id;
              okJson(res, {
                success: true,
              });
            }
          });
        } else {
          errorForbidden(res, "Account not validated");
        }
        return;
      }
      // Faux login : destruction de la session et erreur
      req.session.destroy((err) => {
        if (err) console.error(err);
      });
      errorForbidden(res, "Invalid login or password");
    } catch (e) {
      errorInternalError(res, "Internal Server Error", e.message);
    }
  };

  async authLogout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
        errorInternalError(res, "Internal Server Error", "Could not logout");
      } else {
        okJson({ success: true });
      }
    });
  };
};
