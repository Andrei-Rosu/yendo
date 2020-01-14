const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

// // DELETE API place based on id logic
// exports.deletePlace = catchAsync(async (req, res, next) => {
//   const place = await Place.findByIdAndDelete(req.params.id);
//
//   if (!place) {
//     return next(new AppError('No place found with that ID', 404));
//   }
//
//   res.status(204).json({
//     status: 'success',
//     data: null
//   });
// });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

// // PATCH API place based on id logic
// exports.updatePlace = catchAsync(async (req, res, next) => {
//   const place = await Place.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true
//   });
//
//   if (!place) {
//     return next(new AppError('No place found with that ID', 404));
//   }
//
//   res.status(200).json({
//     status: 'success',
//     data: {
//       place
//     }
//   });
// });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

// POST API place logic
// exports.createPlace = catchAsync(async (req, res, next) => {
//   const newPlace = await Place.create(req.body);
//
//   res.status(201).json({
//     status: 'success',
//     data: {
//       places: newPlace
//     }
//   });
// });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

//
// // GET API id based place logic
// exports.getPlace = catchAsync(async (req, res, next) => {
//   const place = await Place.findById(req.params.id).populate('reviews');
//   // Place.findOne({ _id: req.params.id });
//
//   if (!place) {
//     return next(new AppError('No place found with that ID', 404));
//   }
//
//   res.status(200).json({
//     status: 'success',
//     data: {
//       place
//     }
//   });
// });

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    // Allows nested Get reviews on Place (hack)

    let filter = {};
    if (req.params.placeId) filter = { place: req.params.placeId };

    // Execute query
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const doc = await features.query.explain();
    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc
      }
    });
  });

// GET API places logic
// exports.getAllPlaces = catchAsync(async (req, res, next) => {
//   // Execute query
//   const features = new APIFeatures(Place.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const places = await features.query;
//
//   res.status(200).json({
//     status: 'success',
//     results: places.length,
//     data: {
//       places
//     }
//   });
// });
