const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Place = require('../models/placeModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');

const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked place
  const place = await Place.findById(req.params.placeId);

  // 2) Create the checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?place=${
      req.params.placeId
    }&user=${req.user.id}&price=${place.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/place/${place.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.placeId,
    line_items: [
      {
        name: `${place.name} event`,
        description: place.website,
        images: [`https://www.natours.dev/img/tours/${place.imageCover}`],
        amount: place.price * 100,
        currency: 'eur',
        quantity: 1
      }
    ]
  });

  // 3) Send session as response to client
  res.status(200).json({
    status: 'success',
    session
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // This is TEMPORARY, for being UNSECURE -> People can book without paying
  const { place, user, price } = req.query;

  if (!place && !user && !price) return next();
  await Booking.create({ place, user, price });
  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
