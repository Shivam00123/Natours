const express = require("express");
const viewController = require("../controllers/viewController");

const Router = express.Router();

Router.get("/", viewController.renderOverview);

Router.get("/tour/:slug", viewController.renderTour);

module.exports = Router;
