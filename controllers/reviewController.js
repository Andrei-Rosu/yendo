const Review = require('./../models/reviewModel');
// const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   let filter = {};
//   if (req.params.placeId) filter = { place: req.params.placeId };
//
//   const reviews = await Review.find(filter);
//
//   res.status(200).json({
//     status: 'success',
//     results: reviews.length,
//     data: {
//       reviews
//     }
//   });
// });

exports.setPlaceUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.place) req.body.place = req.params.placeId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

// exports.createReview = catchAsync(async (req, res, next) => {
//   // // Allow nested routes
//   // if (!req.body.place) req.body.place = req.params.placeId;
//   // if (!req.body.user) req.body.user = req.user.id;
//
//   const newReview = await Review.create(req.body);
//
//   res.status(201).json({
//     status: 'success',
//     data: {
//       review: newReview
//     }
//   });
// });
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
