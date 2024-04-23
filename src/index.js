const app = require("./app.js");
const url = process.env.SERVER_URL;
const port = process.env.SERVER_PORT;
app.default.listen(port, () => {
  console.log(`Express: ${url}:${port}`);
});
