const { ObjectId } = require("mongodb");

exports.ValidationDemands = class ValidationDemands {
  db;

  constructor(db) {
    this.db = db;
  }

  async exists(userId) {
    return (await this.db.collection("validation_demands").findOne({ userId })) != null;
  }

  async create(userId, date) {
    const exists = await this.exists(userId);

    if (exists) {
      throw new Error("Validation demand already exists!");
    }

    const validationDemand = await this.db.collection("validation_demands").insertOne({
      userId, requestedDate: date,
    });

    if (validationDemand == null) {
      throw new Error("Could not create validation demand!");
    }

    return validationDemand.insertedId;
  }

  async get(validationDemandId) {
    const validationDemand = await this.db.collection("validation_demands")
      .findOne({ _id: new ObjectId(validationDemandId) });

    if (validationDemand == null) {
      throw new Error("Validation demand does not exist!");
    }

    return validationDemand;
  }

  async accept(validationDemandId, date) {
    const validationDemand = await this.get(validationDemandId);

    if (validationDemand.acceptedDate != null) {
      throw new Error("Validation demand has already accepted!");
    }

    const validationDemandUpdate = await this.db.collection("validation_demands")
      .updateOne({ _id: new ObjectId(validationDemandId) }, { $set: { acceptedDate: date } });

    const userUpdate = await this.db.collection("users")
      .updateOne({ _id: new ObjectId(validationDemand.userId) }, { $set: { validated: true } });

    return validationDemandUpdate.modifiedCount === 1 && userUpdate.modifiedCount === 1;
  }

  async delete(validationDemandId) {
    const validationDemand = await this.db.collection("validation_demands")
      .deleteOne({ _id: new ObjectId(validationDemandId) });
    return validationDemand.deletedCount === 1;
  }

  async getPending() {
    return await this.db.collection("validation_demands").aggregate([
      {
        $match: {
          acceptedDate: null,
        },
      },
      {
        $addFields: {
          userId: { $toObjectId: "$userId" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          "pipeline": [
            { "$project": { "password": 0 } },
          ],
          as: "userDetails",
        },
      },
      {
        $project: {
          userId: 0,
        },
      },
      {
        $unwind: "$userDetails",
      },
    ]).toArray();
  }
};
