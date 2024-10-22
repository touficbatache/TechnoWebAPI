const { ObjectId } = require("mongodb");

exports.Messages = class Messages {
  db;

  constructor(db) {
    this.db = db;
    db.collection("messages").createIndex({ content: "text" }, function (err) {
      if (err) {
        console.error("Error occurred while creating messages index:", err);
        return;
      }
      console.log("Messages index created successfully");
    });
  }

  async create(type, userId, content, title, date, replyTo) {
    const message = await this.db.collection("messages").insertOne({
      type, userId, content, title, date, replyTo,
    });

    if (message == null) {
      throw new Error("Could not create message!");
    }

    return message.insertedId;
  }

  async get(messageId) {
    const messages = await this.db.collection("messages").aggregate([
      {
        $match: {
          _id: new ObjectId(messageId),
        },
      },
      {
        $addFields: {
          messageId: { $toString: "$_id" },
        },
      },
      {
        $lookup: {
          from: "messages",
          localField: "messageId",
          foreignField: "replyTo",
          as: "replies",
        },
      },
      {
        $project: {
          messageId: 0,
        },
      },
    ]).toArray();

    if (messages.length === 0) {
      throw new Error("Message does not exist!");
    }

    return messages[0];
  }

  async getAll(type) {
    return await this.db.collection("messages").aggregate([
      {
        $match: {
          type, replyTo: null,
        },
      },
      {
        $addFields: {
          messageId: { $toString: "$_id" },
        },
      },
      {
        $lookup: {
          from: "messages",
          localField: "messageId",
          foreignField: "replyTo",
          as: "replies",
        },
      },
      {
        $project: {
          messageId: 0,
        },
      },
    ]).toArray();
  }

  async search(query, includePrivate = false) {
    const keywords = (query ?? "").split(" ");
    const regex = keywords.map(keyword => `(?=.*${keyword}.*)`).join("");
    return await this.db.collection("messages").aggregate([
      {
        $match: {
          $or: [
            {
              content: { $regex: regex, $options: "i" },
            },
            {
              title: { $regex: regex, $options: "i" },
            },
            {
              userId: { $regex: regex, $options: "i" },
            },
          ],
          ...(
            !includePrivate ? {
              type: "public",
            } : {}
          ),
        },
      },
    ]).toArray();
  }

  async #getMessagesChildrenIdsRecursively(parentId, result) {
    result.push(new ObjectId(parentId));
    const children = this.db.collection("messages").find({ replyTo: parentId });
    while (await children.hasNext()) {
      const next = await children.next();
      const id = next._id.toString();
      await this.#getMessagesChildrenIdsRecursively(id, result);
    }
  }

  async delete(messageId) {
    const messagesToDeleteIds = [];
    await this.#getMessagesChildrenIdsRecursively(messageId, messagesToDeleteIds);
    const messages = await this.db.collection("messages").deleteMany({ _id: { $in: messagesToDeleteIds } });
    return messages.deletedCount >= 1;
  }
};
