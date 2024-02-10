const express = require("express");
const viewController = require("../controllers/viewController");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const bookingsController = require("../controllers/bookingsController");

const Router = express.Router();

Router.get("/", authController.isLoggedIn, viewController.renderOverview);

Router.get("/tour/:slug", authController.isLoggedIn, viewController.renderTour);

Router.get("/signin", authController.restrictedRoutes, viewController.signIn);

Router.get("/signup", authController.restrictedRoutes, viewController.signUp);

Router.get(
  "/forgot-password",
  authController.restrictedRoutes,
  viewController.forgotPassword
);

Router.get(
  "/verifyOTP/:email",
  authController.isAuthenticated,
  authController.restrictedRoutes,
  viewController.verifyOTP
);

Router.get(
  "/resetPassword/:token",
  authController.restrictedRoutes,
  viewController.resetPassword
);

// Router.use(authController.isAuthenticated);

Router.get(
  "/me",
  authController.isAuthenticated,
  bookingsController.getMyBookings,
  viewController.getMe
);

Router.get(
  "/booking-successful",
  authController.isLoggedIn,
  authController.createBookingCheckout,
  authController.isAuthenticated,
  viewController.bookingSuccessful
);

Router.get(
  "/review",
  authController.isLoggedIn,
  authController.isAuthenticated,
  viewController.addReview
);

Router.get(
  "/selectStartDate/:id",
  authController.isLoggedIn,
  authController.isAuthenticated,
  bookingsController.getMyBookings,
  viewController.selectStartDate
);

module.exports = Router;
