const catchAsync = require("../utils/catchAsync");
const Tour = require("../models/tourModel");
const bcrypt = require("bcryptjs");
const ErrorHandler = require("../utils/errorHandler");

exports.renderOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  const bookings = req.bookings || [];
  const bookedTourIds = bookings.map((el) => el.tour._id.toString());
  res.status(200).render("overview", {
    title: "All Tours",
    tours,
    bookedTourIds,
  });
});

exports.renderTour = catchAsync(async (req, res, next) => {
  const user = req.user;
  const tour = await Tour.find({
    slug: req.params.slug.toLowerCase(),
  }).populate({
    path: "reviews",
    select: "review user rating",
  });
  let isBookingAvailable = false;
  if (
    tour?.[0]?.Dates &&
    tour?.[0]?.Dates.length === tour?.[0]?.startDates.length
  ) {
    for (let date of tour[0].Dates) {
      if (!date.soldOut) {
        isBookingAvailable = true;
        break;
      }
    }
  } else {
    isBookingAvailable = true;
  }

  const bookings = req.bookings || [];
  const bookedTourIds = bookings.map((el) => el.tour._id.toString());
  if (!tour || !tour.length)
    return next(new ErrorHandler("Document not found!", 404));
  res.status(200).render("tour", {
    title: `${tour[0].name} Tour`,
    tour: tour[0],
    user,
    bookedTourIds,
    isBookingAvailable,
  });
});

exports.signIn = (req, res) => {
  res.status(200).render("signin", {
    title: "Sign In",
  });
};

exports.getMe = (req, res) => {
  const user = req.user;
  const bookings = req.booking;
  res.status(200).render("account", {
    title: "Your account setting",
    user,
    bookings,
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

exports.addReview = (req, res) => {
  res.status(200).render("add_review", {
    title: "Add Review",
  });
};

exports.selectStartDate = async (req, res, next) => {
  const tourId = req.params.id;
  if (!tourId) return next(new ErrorHandler("No Tour Found", 404));
  const tour = await Tour.findById(tourId);
  let findAvailableDates = []; // 2021-06-19T09:00:00.000+00:00
  for (let startDate of tour.startDates) {
    // 2021-07-20T09:00:00.000+00:00
    if (tour.Dates?.length) {
      let found = false;
      for (let date of tour.Dates) {
        if (new Date(date.date).getTime() === new Date(startDate).getTime()) {
          found = true;
          if (!date.soldOut) {
            findAvailableDates.push(startDate);
          }
        }
      }
      if (!found) {
        findAvailableDates.push(startDate);
      }
    } else {
      findAvailableDates = [...tour.startDates];
    }
  }
  res.status(200).render("select_date", {
    title: "Select Start Date",
    startDates: tour.startDates,
    ID: tour._id,
    availableDates: findAvailableDates,
  });
};
