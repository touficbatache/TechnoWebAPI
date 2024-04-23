// ---------- Success ----------

exports.okJson = function (res, json) {
  res.status(200).json(json);
};

exports.createdJson = function (res, json) {
  res.status(201).json(json);
};

// ---------- Errors ----------

function error(res, code, message, details = undefined) {
  res.status(code).json({
    status: code, message: `Error: ${message}`, details,
  });
}

exports.errorBadRequest = function (res, message = "Bad Request", details = undefined) {
  error(res, 400, message, details);
};

exports.errorUnauthorized = function (res, message = "Unauthorized", details = undefined) {
  error(res, 401, message, details);
};

exports.errorForbidden = function (res, message = "Forbidden", details = undefined) {
  error(res, 403, message, details);
};

exports.errorNotFound = function (res, message = "Not Found", details = undefined) {
  error(res, 404, message, details);
};

exports.errorInternalError = function (res, message = "Internal Server Error", details = undefined) {
  error(res, 500, message, details);
};
