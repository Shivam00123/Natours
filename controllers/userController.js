const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const ErrorHandler = require("../utils/errorHandler");

const filterNotAllowedValues = (obj, ...allowedValues) => {
  const filteredObject = {};

  Object.keys(obj).forEach((el) => {
    if (allowedValues.includes(el)) {
      filteredObject[el] = obj[el];
    }
  });
  return filteredObject;
};

exports.getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    count: users.length,
    users,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const { password, confirmPassword } = req.body;
  if (password || confirmPassword) {
    return next(
      new ErrorHandler("This route is not valid for password updates!", 400)
    );
  }

  const filteredObjects = filterNotAllowedValues(req.body, "name", "email");
  if (!Object.keys(filteredObjects).length)
    return next(new ErrorHandler("Please provide some values to update", 400));

  const user = await User.findByIdAndUpdate(req.user._id, filteredObjects, {
    new: true,
    runValidators: true,
  });
  if (!user)
    return next(new ErrorHandler("User not find with the Id provided!", 401));

  res.status(200).json({
    status: "success",
    message: "Fields updated successfully!",
    user,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({
    status: "success",
    data: null,
  });
});
