const express = require("express");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

const Router = express.Router({ mergeParams: true });
//every router has access of only there params so i case we are coming from tourRouter it will loose acccess to the tourId so in that case we use this mergeParams to get access of other params in other routes

Router.route("/")
  .get(authController.isAuthenticated, reviewController.getAllReviews)
  .post(
    authController.isAuthenticated,
    authController.restrictTo("user"),
    reviewController.addReview
  );

Router.route("/:reviewId").patch(
  authController.isAuthenticated,
  reviewController.updateReview
);

module.exports = Router;
