const express = require("express");
const path = require("path");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const tourRoutes = require("./Routes/tourRoutes");
const userRouter = require("./Routes/userRoutes");
const reviewRouter = require("./Routes/reviewRoutes");
const ErrorHandler = require("./utils/errorHandler");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

// Set security HTTP header
app.use(helmet());

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

//render components
app.get("/", (req, res) => {
  res.status(200).render("base", {
    tour: "The Forest Hiker",
    text: "This is a text",
  });
});

// Body Parser
app.use(express.json({ limit: "10kb" })); // so body of size upto 10kb is acceptable

app.use(mongoSanitize()); // it removes all the $ sign from req.body so no one can inject some query on the req body

app.use(xss()); // it protect against some malicious code like injecting html and js into the req body

app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsAverage",
      "ratingsQuanity",
      "price",
      "difficulty",
      "maxGroupSize",
    ], // so we pass params to allow duplicate in query
  })
); // so what it does basically when we send two same params in the url that is converted into an array and then since we expect a string and got an array it takes care of that and gives us string of last element of an array.

// limit the requests from same API -> Rate Limiter
const limiter = rateLimit({
  max: 100, // requests
  windowMs: 60 * 60 * 1000, // time stamp how much requests in this particular amount of time
  message: "Too many requests, Please try again in an hour!",
  handler: function (req, res, next) {
    res.status(429).json({
      message: "Too many requests, Please try again in an hour!",
    });
  },
});

app.use("/api", limiter); // this will affect all the api starts with /api

//serving static files
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1/tours", tourRoutes);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);

app.all("*", (req, res, next) => {
  next(new ErrorHandler("Invalid URL!", 404));
});

app.use(globalErrorHandler);

module.exports = app;
