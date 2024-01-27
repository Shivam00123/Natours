const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");
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

exports.getAllTours = factory.getAllDocuments(Tour);

exports.createTour = factory.createOne(Tour);

exports.getTourById = factory.findById(Tour, { path: "reviews" });

exports.updateTourById = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);
