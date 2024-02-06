const jsonwebtoken = require("jsonwebtoken");
const ErrorHandler = require("./errorHandler");
const util = require("util");
const User = require("../models/userModel");

class JsonToken {
  constructor(id) {
    this.id = id;
    this.token = "";
    this.jwtSecret = process.env.JWT_SECRET_TOKEN;
    this.expiresIn = process.env.JWT_EXPIRATION_TIME;
    this.environment = process.env.NODE_ENV;
    this.cookieExpiresIn = process.env.COOKIE_EXPIRES_IN;
  }

  cookieOptionsControl() {
    const cookieOptions = {
      expiresIn: new Date(
        Date.now() + this.cookieExpiresIn * 24 * 60 * 60 * 1000
      ),
      httpOnly: true, // browser cannot interact and modify the cookie
    };
    if (this.environment === "production") {
      cookieOptions.secure = true;
    }
    return cookieOptions;
  }

  async signToken(users, statusCode, res, verified = true) {
    this.token = await jsonwebtoken.sign({ id: this.id }, this.jwtSecret, {
      expiresIn: this.expiresIn,
    });

    res.cookie("jwt", this.token, this.cookieOptionsControl());
    users.password = undefined;
    users.oneTimePassword = undefined;
    users.otpVerification = undefined;

    res.status(statusCode).json({
      status: verified ? "success" : "pending",
      token: this.token,
      data: {
        users,
      },
    });
  }

  async verifyToken(req, res, next) {
    this.token = "";
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      this.token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      this.token = req.cookies.jwt;
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

    //check if user still exists
    const freshUser = await User.findById(verification.id);

    if (!freshUser)
      return next(
        new ErrorHandler("User belonging to this token does not exist.", 401)
      );

    //check user changed the password after token is issued

    if (freshUser.changedPasswordAfter(verification.iat)) {
      return next(
        new ErrorHandler(
          "Password changed before token issued, Please login again!",
          401
        )
      );
    }

    //Grant Access
    req.user = freshUser;
    next();
  }

  async isLoggedIn(req, res, next) {
    if (req.cookies.jwt) {
      const verification = await util.promisify(jsonwebtoken.verify)(
        req.cookies.jwt,
        this.jwtSecret
      );
      if (!verification) return next();
      const freshUser = await User.findById(verification.id).select(
        "+otpVerification"
      );
      if (!freshUser || !freshUser.otpVerification) return next();
      if (freshUser.changedPasswordAfter(verification.iat)) {
        return next();
      }
      req.user = freshUser;
      res.locals.user = freshUser;
    }
    next();
  }

  logout(req, res, next) {
    res.cookie("jwt", "loggedOut", {
      expiresIn: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    res.status(200).json({
      status: "success",
    });
  }
}

module.exports = JsonToken;
