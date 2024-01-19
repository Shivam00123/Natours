const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name cannot be empty!"],
    minlength: [3, "Name too short."],
    maxlength: [40, "Name too long."],
  },
  email: {
    type: String,
    required: [true, "Please provide an email!"],
    unique: true,
    validate: {
      validator: function (value) {
        return validator.isEmail;
      },
      message: "Invalid email, Please provide a valid email.",
    },
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
  passwordChangedAt: Date,
  resetPasswordToken: String,
  resetTokenExpiresIn: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const hashedPassword = await bcrypt.hash(this.password, 12);
  this.password = hashedPassword;
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.correctPasswords = async (candidatePassword, password) => {
  return await bcrypt.compare(candidatePassword, password);
};

userSchema.methods.createResetToken = async function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetTokenExpiresIn = Date.now() + 10 * 60 * 1000;
  console.log({ resetToken }, this.resetPasswordToken);
  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
