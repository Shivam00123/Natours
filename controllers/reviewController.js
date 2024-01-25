const Review = require("../models/reviewModel");
const catchAsync = require("../utils/catchAsync");
const ErrorHandler = require("../utils/errorHandler");

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const { tourId } = req.params;
  let filter = {};
  if (tourId) filter = { tour: tourId };
  const reviews = await Review.find(filter);
  res.status(200).json({
    status: "success",
    data: reviews,
  });
});

exports.addReview = catchAsync(async (req, res, next) => {
  const { _id } = req.user;
  const { tourId } = req.params;
  req.body.user = _id;
  req.body.tour = tourId;
  const review = await Review.create(req.body);
  res.status(201).json({
    status: "success",
    data: review,
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const { reviewId } = req.params;
  const { newReview, rating } = req.body;
  const review = await Review.findById(reviewId);
  console.log(review.user._id, req.user._id);
  if (JSON.stringify(review.user._id) !== JSON.stringify(req.user._id))
    return next(
      new ErrorHandler("You dont have permission to mdofy the review", 400)
    );

  review.review = newReview;
  await review.save();
  res.status(200).json({
    status: "success",
    message: "review updated successfully!",
  });
});
