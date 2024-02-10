const mongoose = require("mongoose");
const { default: slugify } = require("slugify");
const validator = require("validator");
const User = require("./userModel");

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
        values: ["easy", "difficult", "medium"],
        message: "Difficulty is either: Easy , Medium or Difficult.",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "A tour must have a Rating more than or equal to  1.0"],
      max: [5, "A tour must have a Rating less than or eqaul to 5.0"],
    },
    ratingsQuantity: {
      type: Number,
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
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    Dates: [
      {
        date: {
          type: Date,
          unique: true,
          validate: {
            validator: validateDates,
            message: "This date is not available for the current Tour.",
          },
        },
        participants: {
          type: Number,
          default: 0,
          validate: {
            validator: validateParticipants,
            message: "Participants full",
          },
        },
        soldOut: {
          type: Boolean,
          default: false,
        },
      },
    ],
    slug: {
      type: String,
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        description: String,
        address: String,
        day: Number,
      },
    ],
    // guides: Array, for embedding User
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

function validateDates(date) {
  for (let startDate of this.parent().startDates) {
    if (String(startDate) === String(date)) {
      return true;
    }
  }
  if (this.parent().Dates) {
    const object = this.parent().Dates.filter(
      (el) => String(el.date) === String(date)
    );
    if (object.soldOut) {
      return false;
    }
  }
  return true;
}

function validateParticipants(value) {
  if (this.parent().maxGroupSize < value) {
    return false;
  }
  return true;
}

tours.index({ price: 1, ratingsAverage: -1 }); //price->asc ra->desc

tours.index({ startLocation: "2dsphere" });

tours.virtual("saving").get(function () {
  const saving = (this.price * this.priceDiscount) / 100;
  return Math.floor(saving) || 0;
});

tours.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

tours.pre("save", function (next) {
  const name = this.name.toLowerCase();
  this.slug = slugify(name);
  next();
});

tours.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt",
  });
  next();
});

//** Embedding User in tours */
// tours.pre("save", async function (next) {
//   const guidesPromise = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromise);
//   next();
// });

const Tour = mongoose.model("Tour", tours);

module.exports = Tour;
