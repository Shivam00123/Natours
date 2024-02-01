const express = require("express");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");
const Review = require("../models/reviewModel");

const Router = express.Router({ mergeParams: true });

Router.use(authController.isAuthenticated);
//every router has access of only there params so i case we are coming from tourRouter it will loose acccess to the tourId so in that case we use this mergeParams to get access of other params in other routes

Router.route("/")
  .get(authController.isAuthenticated, reviewController.getAllReviews)
  .post(
    authController.restrictTo("user"),
    reviewController.setTourAndUserIds,
    reviewController.addReview
  );

Router.route("/:id")
  .patch(
    authController.userAllowedOnlyWith()(Review), // only author of review can update it
    reviewController.removeUnwantedFields,
    reviewController.updateReview
  )
  .delete(
    authController.userAllowedOnlyWith("admin", "lead-guide")(Review), // only author of review or lead-guide or admin can delete it
    reviewController.deleteReview
  );
module.exports = Router;
