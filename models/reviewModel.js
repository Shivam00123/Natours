const mongoose = require("mongoose");
const Tour = require("./tourModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "A review cannot be empty!"],
    },
    rating: {
      type: Number,
      min: [1, "A rating must be greater than or equal to 1"],
      max: [5, "A rating must be less than or equal to 5"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user!"],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour!"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  // path: "user",
  // select: "name photo",
  // }).populate({
  //   path: "tour",
  //   select: "name",
  // });
  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});

reviewSchema.index({ user: 1, tour: 1 }, { unique: true }); // we want that 1 user can only post 1 review for each tour

reviewSchema.statics.calcAvgRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        reviewCount: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  if (tourId) {
    console.log("called");
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQauntity: stats?.[0]?.reviewCount,
      ratingsAverage: stats?.[0]?.avgRating,
    });
  }
};

reviewSchema.post("save", function () {
  this.constructor.calcAvgRatings(this.tour); // this.contructor points to the parent which doc is created from -> model
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne().clone();
  this.r.ReviewUpdateAndDelete = true;
  next();
});

reviewSchema.post("findOne", async function () {
  if (this.r.ReviewUpdateAndDelete) {
    this.r.constructor.calcAvgRatings(this.r.tour);
  }
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
