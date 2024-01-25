const express = require("express");
const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");
const reviewRouter = require("../Routes/reviewRoutes");

const tourRoutes = express.Router();

tourRoutes.use("/:tourId/reviews", reviewRouter);

//get top 5 tours
tourRoutes
  .route("/top-5-tours")
  .get(
    authController.isAuthenticated,
    tourController.getBestTours,
    tourController.getAllTours
  );

tourRoutes
  .route("/")
  .get(tourController.getAllTours)
  .post(
    authController.isAuthenticated,
    authController.restrictTo("admin"),
    tourController.createTour
  );

tourRoutes
  .route("/get-stats")
  .get(
    authController.isAuthenticated,
    authController.restrictTo("admin"),
    authController.isAuthenticated,
    tourController.getTourStats
  );

tourRoutes
  .route("/get-yearlyStats/:year")
  .get(
    authController.isAuthenticated,
    authController.restrictTo("admin"),
    authController.isAuthenticated,
    tourController.getYearlyStats
  );

tourRoutes
  .route("/:id")
  .get(tourController.getTourById)
  .patch(
    authController.isAuthenticated,
    authController.restrictTo("admin"),
    tourController.updateTourById
  )
  .delete(
    authController.isAuthenticated,
    authController.restrictTo("admin"),
    tourController.deleteTour
  );

module.exports = tourRoutes;
