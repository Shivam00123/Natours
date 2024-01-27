const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const ErrorHandler = require("../utils/errorHandler");

exports.deleteOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return next(new ErrorHandler("No document find by this Id", 400));

    res.status(204).json({
      status: "success",
      data: null,
      message: "No content",
    });
  });
};

exports.updateOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return next(new ErrorHandler("Invalid document Id", 404));
    res.status(200).json({
      status: "success",
      data: doc,
    });
  });
};

exports.createOne = (Model) => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: doc,
    });
  });
};

exports.findById = (Model, populateOptions) => {
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;
    if (!doc) return next(new ErrorHandler("No document found!", 404));
    res.status(200).json({
      status: "success",
      data: doc,
    });
  });
};

exports.getAllDocuments = (Model) => {
  return catchAsync(async (req, res, next) => {
    const { tourId } = req.params;
    let filter = {};
    if (tourId) filter = { tour: tourId };
    const features = new APIFeatures(req.query, Model)
      .filter()
      .sort()
      .limiting()
      .paginate();
    // const doc = await features.model.explain(); gives the stats of the docs
    const doc = await features.model;
    res.status(200).json({
      status: "success",
      count: doc.length,
      data: doc,
    });
  });
};

exports.ownerOnlyPermission = (Model) => {
  return catchAsync(async (req, res, next) => {
    const docId = req.params.id;
    const doc = await Model.findById(docId);
    if (!doc) return next(new ErrorHandler("No document found!", 404));

    if (JSON.stringify(req.user._id) !== JSON.stringify(doc.user._id))
      return next(
        new ErrorHandler(
          "You dont have permission to perform this action!",
          400
        )
      );
    next();
  });
};

exports.ownerAndAdminOnlyPermission = (Model) => {
  return catchAsync(async (req, res, next) => {
    const docId = req.params.id;
    const doc = await Model.findById(docId);
    if (!doc) return next(new ErrorHandler("No document found!", 404));

    if (
      JSON.stringify(req.user._id) !== JSON.stringify(doc.user._id) &&
      req.user.role !== "admin"
    )
      return next(
        new ErrorHandler(
          "You dont have permission to perform this action!",
          400
        )
      );
    next();
  });
};
