const ErrorHandler = require("../utils/errorHandler");

const errorOnDevelopment = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else {
    res.status(err.statusCode).render("error", {
      title: "Something went wrong!",
      msg: err.message,
    });
  }
};

const errorOnProduction = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    if (!err.isOperational) {
      res.status(500).json({
        status: "error",
        message: "Something went wrong!",
      });
    }
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong!",
      msg: err.message,
    });
  }
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong!",
    msg: "Try again later!",
  });
};

const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  const error = new ErrorHandler(message, 400);
  return error;
};

const handleValidationError = (err) => {
  const errorsArray = Object.values(err.errors)
    ?.map((el) => el.message)
    .join(". ");
  const message = `Invalid inputs: ${errorsArray}`;
  const errorObject = new ErrorHandler(message, 400);
  return errorObject;
};

const handleDuplicationError = (err) => {
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value ${value}. Please use another value!`;
  const errorObj = new ErrorHandler(message, 400);
  return errorObj;
};

const handleJSONWebTokenError = (error) =>
  new ErrorHandler("Token is either invalid or expired!", 401);

module.exports = (err, req, res, next) => {
  console.log({ err });
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  let error = { ...err, name: err.name, code: err.code, message: err.message };
  if (error.name === "CastError") error = handleCastError(error);
  if (error.name === "ValidationError") error = handleValidationError(error);
  if (error.code === 11000) error = handleDuplicationError(error);
  if (
    error.name === "JsonWebTokenError" ||
    error.name === "TokenExpiredError"
  ) {
    error = handleJSONWebTokenError(error);
  }

  if (process.env.NODE_ENV === "production") {
    errorOnProduction(error, req, res);
  } else if (process.env.NODE_ENV === "development") {
    errorOnDevelopment(error, req, res);
  }
};
