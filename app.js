const express = require("express");
const tourRoutes = require("./Routes/tourRoutes");
const userRouter = require("./Routes/userRoutes");
const ErrorHandler = require("./utils/errorHandler");
const globalErrorHandler = require("./controllers/errorController");

const app = express();
app.use(express.json());

app.use("/api/v1/tours", tourRoutes);
app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
  next(new ErrorHandler("Invalid URL!", 404));
});

app.use(globalErrorHandler);

module.exports = app;
