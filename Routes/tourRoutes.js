const express = require("express");
const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");
const reviewController = require("../controllers/reviewController");
const reviewRouter = require("../Routes/reviewRoutes");

const tourRoutes = express.Router();

tourRoutes.use("/:tourId/reviews", reviewRouter);

tourRoutes.use(authController.isAuthenticated);

//get top 5 tours
tourRoutes
  .route("/top-5-tours")
  .get(
    authController.restrictTo("admin", "lead-guides"),
    tourController.getBestTours,
    tourController.getAllTours
  );

tourRoutes
  .route("/")
  .get(tourController.getAllTours)
  .post(
    authController.restrictTo("admin", "lead-guides"),
    tourController.createTour
  );

tourRoutes
  .route("/get-stats")
  .get(
    authController.isAuthenticated,
    authController.restrictTo("admin", "lead-guide"),
    authController.isAuthenticated,
    tourController.getTourStats
  );

tourRoutes
  .route("/get-yearlyStats/:year")
  .get(
    authController.isAuthenticated,
    authController.restrictTo("admin", "lead-guide"),
    authController.isAuthenticated,
    tourController.getYearlyStats
  );

tourRoutes
  .route("/:id")
  .get(tourController.getTourById)
  .patch(
    authController.isAuthenticated,
    authController.restrictTo("admin", "lead-guide"),
    tourController.updateTourById
  )
  .delete(
    authController.isAuthenticated,
    authController.restrictTo("admin", "lead-guide"),
    tourController.deleteTour
  );

module.exports = tourRoutes;
