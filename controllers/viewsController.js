const Place = require('../models/placeModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get place data from collection
  const places = await Place.find();
  // 2) Build template

  // 3) Render template using place data from step 1

  res.status(200).send({
    title: 'All Places',
    places
  });
});

exports.getPlace = catchAsync(async (req, res, next) => {
  // 1) Get the data for the requested place(including reviews and guides)

  const place = await Place.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review, rating user'
  });

  if (!place) {
    return next(new AppError('There is no place with that name'), 404);
  }

  // 2) Render template using data from step 1

  res.status(200).send('place', {
    title: `${place.name}`,
    place
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).send('login', {
    title: 'Log into your account'
  });
};

exports.getAccount = (req, res) => {
  res.status(200).send('account', {
    title: 'Your account'
  });
};

exports.getMyEvents = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find Places with the returned id's
  const placeIds = bookings.map(el => el.place);
  const places = await Place.find({ _id: { $in: placeIds } });

  res.status(200).send('overview', {
    title: 'My Events',
    places
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );
  res.status(200).send('account', {
    title: 'Your account',
    user: updatedUser
  });
});
