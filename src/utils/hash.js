const { createHash } = require("crypto");

exports.hash = function (string) {
  return createHash("sha256").update(string).digest("hex");
};
