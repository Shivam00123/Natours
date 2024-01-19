const ErrorHandler = require("../utils/errorHandler");

const errorOnDevelopment = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const errorOnProduction = (err, res) => {
  if (!err.isOperational) {
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  } else {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
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

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  let error = { ...err, name: err.name, code: err.code, message: err.message };
  if (error.name === "CastError") error = handleCastError(error);
  if (error.name === "ValidationError") error = handleValidationError(error);
  if (error.code === 11000) error = handleDuplicationError(error);
  if (process.env.NODE_ENV === "production") {
    errorOnProduction(error, res);
  } else if (process.env.NODE_ENV === "development") {
    errorOnDevelopment(error, res);
  }
};
