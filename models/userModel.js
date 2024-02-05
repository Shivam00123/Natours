const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Email = require("../utils/email");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name cannot be empty!"],
    minlength: [3, "Name too short."],
    maxlength: [40, "Name too long."],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },

  profile: {
    type: String,
  },
  password: {
    type: String,
    required: [true, "A Password cannot be empty!"],
    minlength: [
      8,
      "Password too short, Password must be more than or equal to 8 character long.",
    ],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "Password does not match"],
    validate: {
      validator: function (value) {
        return this.password === value;
      },
      message: "Password does not match",
    },
  },
  role: {
    type: String,
    default: "user",
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  oneTimePassword: { type: String, select: false },
  otpVerification: {
    type: Boolean,
    default: false,
    select: false,
  },
  passwordChangedAt: Date,
  resetPasswordToken: String,
  resetTokenExpiresIn: Date,
});

userSchema.pre("save", async function (next) {
  if (this.role === "admin") {
    this.role = "user";
  }
  if (!this.isModified("password")) return next();
  const hashedPassword = await bcrypt.hash(this.password, 12);
  this.password = hashedPassword;
  this.confirmPassword = undefined;
  const OTP = String(Math.floor(100000 + Math.random() * 900000));
  const user = { name: this.name, email: this.email };
  this.oneTimePassword = crypto.createHash("sha256").update(OTP).digest("hex");
  await new Email(user).sendOTP(OTP);

  next();
});

userSchema.methods.correctPasswords = async (candidatePassword, password) => {
  return await bcrypt.compare(candidatePassword, password);
};

userSchema.methods.changedPasswordAfter = (JWTTimestamp) => {
  if (this.passwordChangedAt) {
    const convertPasswordChangedAt = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return convertPasswordChangedAt > JWTTimestamp;
  }
  return false;
};

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.createResetToken = async function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetTokenExpiresIn = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
