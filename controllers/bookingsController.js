const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const factory = require("./handlerFactory");

const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");
const Booking = require("../models/bookingModel");

exports.requestCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);
  const startDate = req.params.startdate;
  const customer = await stripe.customers.create({
    name: req.user.name,
    email: req.user.email,
    address: {
      line1: "510 Townsend St",
      postal_code: "98140",
      city: "San Francisco",
      state: "CA",
      country: "US",
    },
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    success_url: `${req.protocol}://${req.get(
      "host"
    )}/booking-successful?tour=${tour._id}&user=${req.user._id}&price=${
      tour.price
    }&startdate=${startDate}`,
    cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: "inr",
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
        quantity: 1,
      },
    ],
    customer: customer.id,
    metadata: {
      name: `${tour.name} Tour`,
      description: tour.summary,
      email: req.user.email,
    },
  });

  res.status(200).json({
    status: "success",
    session,
  });
});

exports.getMyBookings = catchAsync(async (req, res, next) => {
  const user = req.user._id;
  const Bookings = await Booking.find({ user: user }).populate({
    path: "tour",
    select: ["name", "price", "imageCover", "slug", "startDates"],
  });
  req.booking = Bookings;
  next();
});

exports.cancelBooking = factory.deleteOne(Booking);
