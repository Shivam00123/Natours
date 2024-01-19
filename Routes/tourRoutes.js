const express = require("express");
const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");

const tourRoutes = express.Router();

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
  .post(tourController.createTour);

tourRoutes.route("/get-stats").get(tourController.getTourStats);

tourRoutes.route("/get-yearlyStats/:year").get(tourController.getYearlyStats);

tourRoutes
  .route("/:id")
  .get(tourController.getTourById)
  .patch(tourController.updateTourById);

module.exports = tourRoutes;
