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
  }).populate({
    path: "reviews",
    select: "review user rating",
  });
  console.log({ tour });
  res.status(200).render("tour", {
    title: `${tour[0].name} Tour`,
    tour: tour[0],
  });
});

exports.signIn = (req, res) => {
  res.status(200).render("signin", {
    title: "Sign In",
  });
};
