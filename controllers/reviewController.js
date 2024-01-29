const Review = require("../models/reviewModel");
const factory = require("../controllers/handlerFactory");
const filterOutUnwantedTags = require("../utils/filterOutUnwantedTags");

exports.setTourAndUserIds = (req, res, next) => {
  const { _id } = req.user;
  const { tourId } = req.params;
  req.body.user = _id;
  req.body.tour = tourId;
  next();
};

exports.removeUnwantedFields = (req, res, next) => {
  const filteredObjects = filterOutUnwantedTags(req.body, [
    "user",
    "tour",
    "createdAt",
  ]);
  req.body = filteredObjects;
  next();
};

exports.getAllReviews = factory.getAllDocuments(Review);

exports.addReview = factory.createOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);

exports.deleteRelatedToTour = factory.deleteMany(Review, "tour");

exports.ownerAndAdminOnlyPermission =
  factory.ownerAndAdminOnlyPermission(Review);

exports.ownlerOnlyPermission = factory.ownerOnlyPermission(Review);
