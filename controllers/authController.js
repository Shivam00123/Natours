const jsonwebtoken = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const ErrorHandler = require("../utils/errorHandler");
const JsonToken = require("../utils/jsonWebToken");
const sendEmail = require("../utils/email");

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

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //get user with email;
  const { email } = req.body;
  if (!email) return next(new ErrorHandler("Please provide an Email!", 400));

  const user = await User.findOne({ email });
  if (!user) return next(new ErrorHandler("User not found!", 400));

  const resetToken = await user.createResetToken();
  user.save({ validateBeforeSave: false });

  const linkToResetPassword = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const subject = "Your Password reset Token is valid for 10min";
  const message = `Forgot your password? Submit a patch request with your new password and confirmPassword to ${linkToResetPassword}.\nif you didn't forget your password, Please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject,
      message,
    });
    res.status(200).json({
      status: "success",
      message: "Token sent to mail.",
    });
  } catch (error) {
    this.resetPasswordToken = undefined;
    this.resetTokenExpiresIn = undefined;
    user.save({ validateBeforeSave: false });
    return next(new ErrorHandler("Something went wrong, Try again later", 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashToken,
    resetTokenExpiresIn: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorHandler("Token is either Invalid or expired", 400));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.resetPasswordToken = undefined;
  user.resetTokenExpiresIn = undefined;

  await user.save();

  const token = await new JsonToken(user._id).signToken();
  res.status(200).json({
    status: "success",
    token,
    user,
  });
});
