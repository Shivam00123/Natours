const crypto = require("crypto");
const User = require("../models/userModel");
const Booking = require("../models/bookingModel");
const catchAsync = require("../utils/catchAsync");
const ErrorHandler = require("../utils/errorHandler");
const JsonToken = require("../utils/jsonWebToken");
const Email = require("../utils/email");
const { generateOTP } = require("../utils/generateOTP");
const Tour = require("../models/tourModel");

exports.createUser = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    profile: req.body.profile,
    role: req.body.role,
  });
  await new JsonToken(user._id).signToken(user, 201, req, res);
});

exports.loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Invalid email or password!", 400));
  }

  const user = await User.findOne({ email })
    .select("+password")
    .select("+otpVerification");
  if (!user) return next(new ErrorHandler("User not found!", 404));

  const checkPassword = await user.correctPasswords(password, user.password);
  if (!checkPassword) {
    return next(new ErrorHandler("Invalid email or password", 404));
  }
  if (!user.otpVerification) {
    await generateOTP(user);
    return await new JsonToken(user._id).signToken(user, 200, req, res, false);
  }
  await new JsonToken(user._id).signToken(user, 200, req, res);
});

exports.isAuthenticated = catchAsync(async (req, res, next) => {
  await new JsonToken().verifyToken(req, res, next);
});

exports.isLoggedIn = async (req, res, next) => {
  try {
    await new JsonToken().isLoggedIn(req, res, next);
  } catch (err) {
    next();
  }
};

exports.restrictedRoutes = async (req, res, next) => {
  try {
    const state = await new JsonToken().loggedInState(req, res, next);
    if (state) {
      res.status(301).redirect("/");
    } else {
      next();
    }
  } catch (error) {
    next();
  }
};

exports.logout = (req, res) => {
  new JsonToken().logout(req, res);
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //get user with email;
  const email = req.body.email;
  if (!email) return next(new ErrorHandler("Please provide an Email!", 400));

  const user = await User.findOne({ email });
  if (!user) return next(new ErrorHandler("User not found!", 400));

  const resetToken = await user.createResetToken();
  user.save({ validateBeforeSave: false });

  const linkToResetPassword = `${req.protocol}://${req.get(
    "host"
  )}/resetPassword/${resetToken}`;

  await new Email(user, linkToResetPassword).sendPasswordReset();
  res.status(200).json({
    status: "success",
  });
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

  res.status(200).json({
    status: "success",
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, password, confirmPassword } = req.body;
  if (!currentPassword || !password || !confirmPassword) {
    return next(new ErrorHandler("Please fill all the fields!", 400));
  }
  let user = await User.findById(req.user._id).select("+password");

  if (!user) return next(new ErrorHandler("User not found", 400));

  // check password
  const checkPassword = await user.correctPasswords(
    currentPassword,
    user.password
  );
  if (!checkPassword) {
    return next(
      new ErrorHandler(
        "Current password does not match with your old password",
        401
      )
    );
  }
  //update password
  user.password = password;
  user.confirmPassword = confirmPassword;
  user.passwordChangedAt = Date.now();
  await user.save({ validateBeforeSave: true });

  await new JsonToken(user._id).signToken(user, 200, req, res);
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          "Admin and Lead-Guides does not have permission to perform this action",
          403
        )
      );
    }

    next();
  };
};

exports.userAllowedOnlyWith = (...permitted) => {
  return (Model) => {
    return catchAsync(async (req, res, next) => {
      const doc = await Model.findById(req.params.id);
      if (!doc) return next(new ErrorHandler("No document found!", 404));

      if (
        JSON.stringify(req.user._id) !== JSON.stringify(doc.user._id) &&
        !permitted.includes(req.user.role)
      ) {
        return next(
          new ErrorHandler(
            "You dont have permission to perform this action!",
            400
          )
        );
      }
      next();
    });
  };
};

exports.verifyUserOTP = catchAsync(async (req, res, next) => {
  const { OTP } = req.body;
  const user_OTP = String(
    crypto.createHash("sha256").update(OTP).digest("hex")
  );
  const user = await User.findOne({
    oneTimePassword: user_OTP,
    otpExpiration: { $gt: Date.now() },
  });
  if (!user)
    return next(
      new ErrorHandler(
        "Invalid OTP, Your OTP is either invalid or Expired, Please generate new OTP",
        400
      )
    );
  user.oneTimePassword = undefined;
  user.otpVerification = true;
  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    status: "success",
  });
});

exports.resendOTP = catchAsync(async (req, res, next) => {
  const user = req.user;
  if (!user) return next(new ErrorHandler("User not found", 404));

  await generateOTP(user);
  res.status(200).json({
    status: "success",
    user,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, price, user, startdate } = req.query;

  if (tour && user && price) {
    const document = await Tour.findById(tour);
    if (document?.Dates?.length) {
      let dateMatch = false;
      document.Dates.forEach((doc) => {
        if (new Date(doc.date).getTime() === new Date(startdate).getTime()) {
          dateMatch = true;
          if (doc.participants < document.maxGroupSize) {
            doc.participants++;
          } else {
            return next(new ErrorHandler("Booking is already full", 400));
          }
          if (doc.participants === document.maxGroupSize) {
            doc.soldOut = true;
          }
        }
      });
      if (!dateMatch) {
        document.Dates.push({
          date: startdate,
          participants: 1,
          soldOut: false,
        });
      }
    } else {
      document.Dates = [];
      document.Dates.push({
        date: startdate,
        participants: 1,
        soldOut: false,
      });
    }
    await Booking.create({ tour, user, price });
    await document.save();
  }

  next();
});

// http://localhost:3001/booking-successful?tour=5c88fa8cf4afda39709c295a&user=5c8a21f22f8fb814b56fa18a&price=997
