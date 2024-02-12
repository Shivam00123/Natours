const express = require("express");
const authController = require("../controllers/authController");
const bookingsController = require("../controllers/bookingsController");
const Booking = require("../models/bookingModel");

const Router = express.Router();

Router.use(authController.isAuthenticated);

Router.get(
  "/checkout-session/:tourId/:startdate",
  bookingsController.requestCheckoutSession
);

Router.delete(
  "/cancel-booking/:id",
  authController.userAllowedOnlyWith("admin")(Booking),
  bookingsController.cancelBooking
);

module.exports = Router;
