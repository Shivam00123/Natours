const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const ErrorHandler = require("../utils/errorHandler");
const factory = require("./handlerFactory");

exports.getBestTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,difficulty,summary";
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  console.log({ query: req.query });
  const features = new APIFeatures(req.query, Tour)
    .filter()
    .sort()
    .limiting()
    .paginate();
  const tours = await features.model;
  res.status(200).json({
    status: "success",
    count: tours.length,
    data: tours,
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  console.log("body", req.body);
  const tour = await Tour.create(req.body);
  res.status(201).json({
    status: "success",
    data: tour,
  });
});

exports.getTourById = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate("reviews"); // populate will populate all the refrence fields
  if (!tour) return next(new ErrorHandler("No tour found!", 404));
  res.status(200).json({
    status: "success",
    data: tour,
  });
});

exports.updateTourById = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) return next(new ErrorHandler("Invalid tour Id", 404));
  res.status(200).json({
    status: "success",
    data: tour,
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const tourStats = await Tour.aggregate([
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$ratingsAverage" },
      },
    },
  ]);
  res.status(200).json({
    success: "success",
    stats: tourStats,
  });
});

exports.deleteTour = factory.deleteOne(Tour);

exports.getYearlyStats = async (req, res, next) => {
  const year = req.params.year;
  const yearlyStats = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        tourCount: { $sum: 1 },
        name: { $push: "$name" },
      },
    },
    {
      $addFields: {
        month: "$_id",
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        tourCount: -1,
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    count: yearlyStats.length,
    data: yearlyStats,
  });
};
