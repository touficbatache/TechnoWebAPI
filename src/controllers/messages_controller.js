const {
  errorBadRequest, errorUnauthorized, errorInternalError, okJson, errorForbidden, errorNotFound, createdJson,
} = require("../utils/http_handlers");
const { Messages } = require("../entities/messages");

exports.MessagesController = class MessagesController {
  messages;

  constructor(db) {
    this.messages = new Messages(db);
  }

  async messageCreate(req, res) {
    const { type, content, replyTo, title } = req.body;
    if (!type || !content || (!replyTo === !title)) {
      errorBadRequest(res, "Bad Request", "Missing fields");
    } else if (req.session.user.role !== "admin" && type === "private") {
      errorUnauthorized(res, "Unauthorized", "User doesn't have rights");
    } else {
      try {
        if (replyTo != null) {
          const replyToMessage = await this.messages.get(replyTo);

          if (replyToMessage == null) {
            errorNotFound(res, "Not Found", "The message you're replying to doesn't exist");
            return;
          }

          if (replyToMessage.type !== type) {
            errorForbidden(
              res,
              "Forbidden",
              "The message and the message you're replying to don't have the same type",
            );
            return;
          }
        } else if (!title) {
          errorBadRequest(res, "Bad Request", "Title is required for new messages");
          return;
        }
        const messageId = await this.messages.create(type, req.session.userid, content, title, Date.now(), replyTo);
        createdJson(res, { id: messageId });
      } catch (e) {
        errorInternalError(res, "Internal Server Error", e.message);
      }
    }
  }

  async messagesGetAllPublic(req, res) {
    try {
      const messages = await this.messages.getAll("public");
      okJson(res, messages);
    } catch (e) {
      errorInternalError(res, "Internal Server Error", e.message);
    }
  }

  async messagesGetAllPrivate(req, res) {
    try {
      const messages = await this.messages.getAll("private");
      okJson(res, messages);
    } catch (e) {
      errorInternalError(res, "Internal Server Error", e.message);
    }
  }

  async messageGet(req, res) {
    try {
      const message = await this.messages.get(req.params.messageId);
      if (req.session.user.role !== "admin" && message.type === "private") {
        errorUnauthorized(res, "Unauthorized", "User doesn't have rights");
      } else {
        okJson(res, message);
      }
    } catch (e) {
      errorInternalError(res, "Internal Server Error", e.message);
    }
  }

  async messagesSearch(req, res) {
    const { query } = req.body;
    if (!query) {
      errorBadRequest(res, "Bad Request", "Missing fields");
    } else {
      try {
        const includePrivate = req.session?.user?.role === "admin";
        const messages = await this.messages.search(query, includePrivate);
        okJson(res, messages);
      } catch (e) {
        errorInternalError(res, "Internal Server Error", e.message);
      }
    }
  }

  async messageDelete(req, res) {
    try {
      const message = await this.messages.get(req.params.messageId);
      if (req.session.user.role === "admin" || req.session.user._id.toString() === message.userId) {
        const success = await this.messages.delete(req.params.messageId);
        if (success) {
          okJson(res, { success });
        } else {
          errorInternalError(res, "Internal Server Error", "Could not delete message");
        }
      } else {
        errorUnauthorized(res);
      }
    } catch (e) {
      errorInternalError(res, "Internal Server Error", e.message);
    }
  }
};
