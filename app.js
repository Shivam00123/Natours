const express = require("express");
const path = require("path");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");

const tourRoutes = require("./Routes/tourRoutes");
const userRouter = require("./Routes/userRoutes");
const reviewRouter = require("./Routes/reviewRoutes");
const viewRouter = require("./Routes/viewRoutes");
const bookingsRouter = require("./Routes/bookingsRoutes");
const bookingsController = require("./controllers/bookingsController");
const ErrorHandler = require("./utils/errorHandler");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

app.enable("trust proxy"); // heroku act as a proxy and redireact request so thats why we need to trust this proxy in order to get req.secure

// Set security HTTP header
// app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(cors());

// app.use(cors({
//   origin:"https://google.com" // cors will only allow google.com for Access-Control-Allow-Origin
// }))

// So there are two kinds of request 1) Simple Request (get,post) 2) Non-simple Request (put,patch,delete)(or any request which contain cookies and Non_standard Headers)
// Non-Standard-headers => These are the custom headers which we put, these are not part of http specification
// When Non-simple request is made the browser does a Preflight check/phase it this check the browser make a Options request with the headers it got from request to the server (our server) in order to the headers we defined
// then we have to respond back this option request with other header to make browser allow the upcoming request or deny it.
// this way browser dont allow any non-simple request to coonect our server directly.....this is the prt of CORS protocol.

app.options("*", cors()); // options request send ACAO header to allow the Non-simple request
// app.options("/api/v1/users",cors()) allow only for this api
//render components

app.use(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  bookingsController.webhook_checkout
);

// Body Parser
app.use(express.json({ limit: "10kb" })); // so body of size upto 10kb is acceptable
app.use(cookieParser()); // parser the incoming cookie on every request
app.use(express.urlencoded({ extended: true, limit: "10kb" })); // to grab the form submit data that comes in urlencoded format

app.use(mongoSanitize()); // it removes all the $ sign from req.body so no one can inject some query on the req body

app.use(xss()); // it protect against some malicious code like injecting html and js into the req body

app.use(compression());

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

app.use("/", viewRouter);
app.use("/api/v1/tours", tourRoutes);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingsRouter);

app.all("*", (req, res, next) => {
  if (req.originalUrl === "/bundle.js.map") return next();
  next(new ErrorHandler("Invalid URL!", 404));
});

app.use(globalErrorHandler);

module.exports = app;
