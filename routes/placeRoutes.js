const express = require('express');
const placeController = require('./../controllers/placeController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();

// router
//   .route('/:placeId/reviews')
//   .post(authController.protect, reviewController.createReview);

router.use('/:placeId/reviews', reviewRouter);

//router.param('id', placeController.checkID);

router
  .route('/top-5-popular')
  .get(placeController.aliasTopPlaces, placeController.getAllPlaces);

router.route('/place-stats').get(placeController.getPlaceStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'guide'),
    placeController.getMonthlyPlan
  );

router
  .route('/places-within/:distance/center/:latlng/unit/:unit')
  .get(placeController.getPlacesWithin);

router.route('/distances/:latlng/unit/:unit').get(placeController.getDistances);

router
  .route('/')
  .get(placeController.getAllPlaces)
  .post(
    placeController.createPlace,
    authController.protect,
    authController.restrictTo('admin', 'guide')
  );

// GET, PATCH, DELETE API single place based on id route

router
  .route('/:id')
  .get(placeController.getPlace)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'guide'),
    placeController.uploadPlaceImages,
    placeController.resizePlaceImages,
    placeController.updatePlace
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'guide'),
    placeController.deletePlace
  );

module.exports = router;
