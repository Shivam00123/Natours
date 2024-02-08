const catchAsync = require("../utils/catchAsync");
const Tour = require("../models/tourModel");
const bcrypt = require("bcryptjs");
const ErrorHandler = require("../utils/errorHandler");

exports.renderOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  const bookings = req.bookings;
  const bookedTourIds = bookings.map((el) => el.tour._id.toString());
  res.status(200).render("overview", {
    title: "All Tours",
    tours,
    bookedTourIds,
  });
});

exports.renderTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.find({
    slug: req.params.slug.toLowerCase(),
  }).populate({
    path: "reviews",
    select: "review user rating",
  });
  const bookings = req.bookings;
  const bookedTourIds = bookings.map((el) => el.tour._id.toString());
  if (!tour || !tour.length)
    return next(new ErrorHandler("Document not found!", 404));
  res.status(200).render("tour", {
    title: `${tour[0].name} Tour`,
    tour: tour[0],
    bookedTourIds,
  });
});

exports.signIn = (req, res) => {
  res.status(200).render("signin", {
    title: "Sign In",
  });
};

exports.getMe = (req, res) => {
  const user = req.user;
  const bookedTours = req.booking;
  res.status(200).render("account", {
    title: "Your account setting",
    user,
    bookedTours,
  });
};

exports.signUp = (req, res) => {
  res.status(200).render("signup", {
    title: "Register",
  });
};

exports.verifyOTP = (req, res) => {
  res.status(200).render("otp_verify", {
    title: "Verification",
  });
};

exports.forgotPassword = (req, res) => {
  res.status(200).render("forgotPassword", {
    title: "Forgot Your Password",
  });
};

exports.resetPassword = (req, res) => {
  res.status(200).render("resetPassword", {
    title: "Password Reset",
  });
};

exports.bookingSuccessful = (req, res) => {
  res.status(200).render("bookingSuccessful", {
    title: "Booking Successful",
  });
};
