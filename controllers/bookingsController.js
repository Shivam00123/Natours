const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const factory = require("./handlerFactory");

const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");
const Booking = require("../models/bookingModel");
const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");

exports.requestCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);
  const startDate = req.params.startdate;
  console.log({ tour, startDate });
  if (!tour || !startDate)
    return next(new ErrorHandler("Tour or StartDate not found", 400));
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
    success_url: `${req.protocol}://${req.get("host")}/booking-successful`,
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
      user_id: req.user._id,
      startDate,
    },
  });
  console.log("session created");

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

const createBookingCheckout = async (session, next) => {
  const tour = session.client_reference_id;
  const user = session.metadata.user_id;
  const startdate = session.metadata.startDate;
  const price = session.line_items[0].price_data.unit_amount / 100;
  console.log({ tour, user, startdate, price });
  if (tour && user && price) {
    const document = await Tour.findById(tour);
    console.log({ id1: document._id });
    if (document?.Dates?.length) {
      console.log({ id2: document.Dates });
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
      console.log({ id3: dateMatch });
      if (!dateMatch) {
        document.Dates.push({
          date: startdate,
          participants: 1,
          soldOut: false,
        });
      }
    } else {
      console.log({ id4: "else" });
      document.Dates = [];
      document.Dates.push({
        date: startdate,
        participants: 1,
        soldOut: false,
      });
    }
    console.log({ id5: "create booking" });
    await Booking.create({ tour, user, price });
    console.log({ id6: "save doc" });
    await document.save();
    console.log({ id7: "saved doc" });
  }
};

exports.webhook_checkout = async (req, res, next) => {
  const signature = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_SIGNING_SECRET
    );
  } catch (error) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }
  if (event.type === "checkout.session.completed") {
    await createBookingCheckout(event.data.object, next);
  }
  res.status(200).json({ success: true });
};

exports.cancelBooking = factory.deleteOne(Booking);
