const express = require("express");
const viewController = require("../controllers/viewController");
const authController = require("../controllers/authController");

const Router = express.Router();

Router.get("/", authController.isLoggedIn, viewController.renderOverview);

Router.get("/tour/:slug", authController.isLoggedIn, viewController.renderTour);

Router.get("/signin", authController.isLoggedIn, viewController.signIn);

Router.get("/signup", viewController.signUp);

Router.get("/verifyOTP", viewController.verifyOTP);

// Router.use(authController.isAuthenticated);

Router.get("/me", authController.isAuthenticated, viewController.getMe);

module.exports = Router;
