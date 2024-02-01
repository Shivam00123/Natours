const Review = require("../models/reviewModel");
const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");
const ErrorHandler = require("../utils/errorHandler");
const factory = require("./handlerFactory");

exports.getBestTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,difficulty,summary";
  next();
};

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

exports.getTourWithinRadius = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [latitude, longitude] = latlng.split(",");
  if (!latitude || !longitude) {
    return next(new ErrorHandler("No cordinates provided!", 400));
  }
  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[longitude, latitude], radius] },
    },
  });
  res.status(200).json({
    status: "success",
    count: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getTourNearest = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [latitude, longitude] = latlng.split(",");
  if (!latitude || !longitude) {
    return next(new ErrorHandler("No cordinates provided!", 400));
  }

  const multiplier = unit === "mi" ? 0.000621371 : 0.001;

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [longitude * 1, latitude * 1],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    count: distances.length,
    data: {
      data: distances,
    },
  });
});

exports.getAllTours = factory.getAllDocuments(Tour);

exports.createTour = factory.createOne(Tour);

exports.getTourById = factory.findById(Tour, { path: "reviews" });

exports.updateTourById = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour, Review);
