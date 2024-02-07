const express = require("express");
const authController = require("../controllers/authController");
const bookingsController = require("../controllers/bookingsController");

const Router = express.Router();

Router.use(authController.isAuthenticated);

Router.get(
  "/checkout-session/:tourId",
  bookingsController.requestCheckoutSession
);

module.exports = Router;
