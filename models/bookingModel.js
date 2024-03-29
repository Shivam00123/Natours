const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "A booking must have a user"],
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: "Tour",
    required: [true, "A booking must have a tour"],
  },
  price: {
    type: Number,
    required: [true, "A booking must have a price"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

bookingSchema.index({ user: 1, tour: 1 }, { unique: true });

bookingSchema.pre(/^find/, function (next) {
  this.populate({
    path: "tour",
    select: ["name", "slug", "imageCover"],
  });
  next();
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
