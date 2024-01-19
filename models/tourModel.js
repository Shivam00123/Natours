const mongoose = require("mongoose");
const { default: slugify } = require("slugify");
const validator = require("validator");

const tours = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
      maxlength: [
        40,
        "A tour Name must have less than or equal to 40 characters",
      ],
      minlength: [
        5,
        "A tour Name must have more than or equal to 5 characters",
      ],
    },
    price: {
      type: Number,
      required: [true, "A tour must have a Price!"],
    },
    duration: {
      type: Number,
      required: [true, "A tour must have a Duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a Group Size."],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a Difficulty panel."],
      enum: {
        values: ["Easy", "Difficult", "Medium"],
        message: "Difficulty is either: Easy , Medium or Difficult.",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "A tour must have a Rating more than or equal to  1.0"],
      max: [5, "A tour must have a Rating less than or eqaul to 5.0"],
    },
    ratingsQauntity: {
      type: Number,
      default: 0,
    },
    priceDiscount: {
      type: Number,
      min: [0, "A discount percent cannot be less than 0%"],
      max: [100, "A discount percent cannot be more than 100%"],
      validate: {
        validator: function (value) {
          return value < this.price;
        },
        message: "A Price Discount ({VALUE}) must be less than the tour price!",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a Summary."],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a Image Cover!"],
    },
    images: String,
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    slug: {
      type: String,
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tours.virtual("saving").get(function () {
  const saving = (this.price * this.priceDiscount) / 100;
  return Math.floor(saving) || 0;
});

tours.pre("save", function (next) {
  this.slug = slugify(this.name);
  next();
});

const Tour = mongoose.model("Tour", tours);

module.exports = Tour;
