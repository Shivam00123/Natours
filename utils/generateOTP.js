const crypto = require("crypto");
const Email = require("./email");

exports.generateOTP = async (doc) => {
  const OTP = String(Math.floor(100000 + Math.random() * 900000));
  const userInfo = { name: doc.name, email: doc.email };
  doc.oneTimePassword = crypto.createHash("sha256").update(OTP).digest("hex");
  const otp_expiration = process.env.OTP_EXPIRATION * 1;
  doc.otpExpiration = Date.now() + otp_expiration * 60 * 1000;
  await doc.save({ validateBeforeSave: false });
  await new Email(userInfo).sendOTP(OTP);
};
