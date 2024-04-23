const { hash } = require("../utils/hash");
const { ObjectId } = require("mongodb");

exports.Users = class Users {
  db;
  defaultOptions;

  constructor(db) {
    this.db = db;
    this.defaultOptions = { projection: { password: 0 } };
  }

  async exists(login) {
    return (await this.db.collection("users").findOne({ login })) != null;
  }

  async create(login, password, lastname, firstname) {
    const exists = await this.exists(login);

    if (exists) {
      throw new Error("Username already taken!");
    }

    const user = await this.db.collection("users").insertOne({
      login, password: hash(password), lastname, firstname, role: "member", validated: false,
    });

    if (user == null) {
      throw new Error("Could not create user!");
    }

    return user.insertedId;
  }

  async checkpassword(login, password) {
    const user = await this.db.collection("users")
      .findOne({ login, password: hash(password) }, this.defaultOptions);

    if (user == null) {
      throw new Error("User does not exist!");
    }

    return user;
  }

  async get(userid) {
    const user = await this.db.collection("users")
      .findOne({ _id: new ObjectId(userid) }, this.defaultOptions);

    if (user == null) {
      throw new Error("User does not exist!");
    }

    return user;
  }

  async getAll() {
    return await this.db.collection("users").find({}, this.defaultOptions).toArray();
  }
};
