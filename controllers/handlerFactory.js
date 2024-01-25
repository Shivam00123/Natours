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
