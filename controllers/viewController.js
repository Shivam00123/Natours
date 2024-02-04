const catchAsync = require("../utils/catchAsync");
const Tour = require("../models/tourModel");
const bcrypt = require("bcryptjs");
const ErrorHandler = require("../utils/errorHandler");

exports.renderOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

exports.renderTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.find({
    slug: req.params.slug.toLowerCase(),
  }).populate({
    path: "reviews",
    select: "review user rating",
  });
  if (!tour || !tour.length)
    return next(new ErrorHandler("Document not found!", 404));
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

exports.getMe = (req, res) => {
  const user = req.user;
  res.status(200).render("account", {
    title: "Your account setting",
    user,
  });
};
