const jsonwebtoken = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const ErrorHandler = require("../utils/errorHandler");
const JsonToken = require("../utils/jsonWebToken");

// const signJWTToken = (id) => {
//   const jwtSecret = process.env.JWT_SECRET_TOKEN;
//   const expiresIn = process.env.JWT_EXPIRATION_TIME;
//   const token = jsonwebtoken.sign({ id }, jwtSecret, {
//     expiresIn,
//   });
//   return token;
// };

exports.createUser = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    profile: req.body.profile,
  });
  const token = await JsonToken.signToken(user._id);
  res.status(201).json({
    status: "success",
    token,
    user,
  });
});

exports.loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Invalid email or password!", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) return next(new ErrorHandler("User not found!", 404));

  const checkPassword = await user.correctPasswords(password, user.password);
  if (!checkPassword) {
    return next(new ErrorHandler("Invalid email or password", 404));
  }

  const token = await new JsonToken(user._id).signToken();
  res.status(200).json({
    status: "success",
    token,
    user,
  });
});

exports.isAuthenticated = catchAsync(async (req, res, next) => {
  await new JsonToken().verifyToken(req, res, next);
});
