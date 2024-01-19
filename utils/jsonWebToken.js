const jsonwebtoken = require("jsonwebtoken");
const ErrorHandler = require("./errorHandler");
const util = require("util");

class JsonToken {
  constructor(id) {
    this.id = id;
    this.token = "";
    this.jwtSecret = process.env.JWT_SECRET_TOKEN;
    this.expiresIn = process.env.JWT_EXPIRATION_TIME;
  }
  async signToken() {
    this.token = await jsonwebtoken.sign({ id: this.id }, this.jwtSecret, {
      expiresIn: this.expiresIn,
    });
    return this.token;
  }

  async verifyToken(req, res, next) {
    this.token = "";
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      this.token = req.headers.authorization.split(" ")[1];
    }
    if (!this.token)
      return next(
        new ErrorHandler("Unauthorize, Please login to continue.", 401)
      );

    const verification = await util.promisify(jsonwebtoken.verify)(
      this.token,
      this.jwtSecret
    );
    if (!verification)
      return next(
        new ErrorHandler("Unauthorize, Please login to continue.", 401)
      );
    next();
  }
}

module.exports = JsonToken;
