// ---- Unused: ----
// // Détermine le répertoire de base
// const path = require("path");
// const basedir = path.normalize(path.dirname(__dirname));
// console.debug(`Base directory: ${basedir}`);
// app.use(express.static(path.join(__dirname, "public")));

// Import Express
const express = require("express");
const app = express();

// Handle CORS
const cors = require("cors");
app.use(cors({
  origin: process.env.FRONT_URL, // Very important
  credentials: true, // Needed for express session
}));

// Setup express session : handle user session
const session = require("express-session");
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: false,
}));

// Setup database
const { MongoClient } = require("mongodb");
const { Users } = require("./entities/users");
const mongoClient = new MongoClient(process.env.DATABASE_URL);
const mongoDb = mongoClient.db(process.env.DATABASE_NAME);

mongoClient.connect().then(() => {
  console.log("MongoDB: connected");

  app.use(async (req, res, next) => {
    try {
      if (req.session.userid) {
        const users = new Users(mongoDb);
        req.session.user = await users.get(req.session.userid);
      }
    } finally {
      next();
    }
  });

  const api = require("./routes.js");
  app.use("/api", api.default(mongoDb));
}).catch((err) => console.error(err));

// Close database connection when server closes
app.on("close", () => {
  mongoClient.close().then(() => console.log("MongoDB: disconnected"));
});

exports.default = app;
