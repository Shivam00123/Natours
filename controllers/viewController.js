const catchAsync = require("../utils/catchAsync");
const Tour = require("../models/tourModel");
const bcrypt = require("bcryptjs");

exports.renderOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

exports.renderTour = catchAsync(async (req, res, next) => {
  console.log({ slug: req.params.slug.toLowerCase() });
  const tour = await Tour.find({
    slug: req.params.slug.toLowerCase(),
  }).populate("reviews");
  console.log({ tour });
  res.status(200).render("tour", {
    title: tour[0].name,
    tour: tour[0],
  });
});
