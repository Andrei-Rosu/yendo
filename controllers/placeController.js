const multer = require('multer');
const sharp = require('sharp');
const Place = require('./../models/placeModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'The file you are trying to upload is not an image!. Please only upload images.',
        400
      ),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});
// For a mix of multiple and single uploads
exports.uploadPlaceImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);
// For single uploads: upload.single('image') - req.file
// For multiple uploads: upload.array('image', 5) - req.files

exports.resizePlaceImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // 1) Cover image
  req.body.imageCover = `place-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/places/${req.body.imageCover}`);

  // req.body.imageCover = imageCoverFileName;

  // 2) Images in a loop

  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `place-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/places/${filename}`);

      req.body.images.push(filename);
    })
  );
  next();
});

exports.aliasTopPlaces = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-rating,-reviews';
  req.query.fields = 'name,price,reviews,rating';
  next();
};
// const places = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/places-simple.json`)
// );

// exports.checkID = (req, res, next, val) => {
//   console.log(`Place id is ${val}`);
//   if (req.params.id * 1 > places.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID'
//     });
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price'
//     });
//   }
//   next();
// };

exports.getAllPlaces = factory.getAll(Place);

// // GET API places logic
// exports.getAllPlaces = catchAsync(async (req, res, next) => {
//   // Execute query
//   const features = new APIFeatures(Place.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const places = await features.query;
//
//   // const query = Place.find({
//   //   rating: 4,
//   //   location: '75011 Paris'
//   // });
//
//   // const places = await Place.find()
//   //   .where('rating')
//   //   .equals(4)
//   //   .where('location')
//   //   .equals('75011 Paris');
//
//   // Send response
//   res.status(200).json({
//     status: 'success',
//     results: places.length,
//     data: {
//       places
//     }
//   });
// });

exports.getPlace = factory.getOne(Place, { path: 'reviews' });

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

exports.createPlace = factory.createOne(Place);

// // POST API place logic
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

exports.updatePlace = factory.updateOne(Place);

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

exports.deletePlace = factory.deleteOne(Place);

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

exports.getPlaceStats = catchAsync(async (req, res, next) => {
  const stats = await Place.aggregate([
    {
      $match: { rating: { $gte: 1 } }
    },
    {
      $group: {
        _id: '$location',
        numPlaces: { $sum: 1 },
        numReview: { $sum: '$reviews' },
        avgRating: { $avg: '$rating' },
        avgReview: { $avg: '$reviews' },
        minReview: { $min: '$reviews' },
        maxReview: { $max: '$reviews' }
      }
    },
    {
      $sort: { maxReview: 1 }
    } //,
    // {
    //   $match: { _id: { $ne: '75013 Paris' } }
    // }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // 2021

  const plan = await Place.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numPlaceStarts: { $sum: 1 },
        places: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numPlaceStarts: -1 }
    },
    {
      $limit: 500
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});

// /places-within/:distance/center/:latlng/unit/:unit
exports.getPlacesWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400
      )
    );
  }
  const places = await Place.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: 'success',
    results: places.length,
    data: {
      data: places
    }
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400
      )
    );
  }
  const distances = await Place.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});
