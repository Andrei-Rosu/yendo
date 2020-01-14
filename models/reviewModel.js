const mongoose = require('mongoose');
const Place = require('./../models/placeModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty!']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    place: {
      type: mongoose.Schema.ObjectId,
      ref: 'Place',
      required: [true, 'Review must belong to a place']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Prevent duplicate reviews on the same place from the same user
// reviewSchema.index({place:1, user:1},{unique:true});

reviewSchema.pre(/^find/, function(next) {
  // this.populate({
  //   path: 'place',
  //   select: 'name'
  // }).populate({
  //   path: 'user',
  //   select: 'name photo'
  // });

  this.populate({
    path: 'user',
    select: 'name photo'
  });

  next();
});

reviewSchema.statics.calcRatings = async function(placeId) {
  const stats = await this.aggregate([
    {
      $match: { place: placeId }
    },
    {
      $group: {
        _id: '$place',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  // console.log(stats);
  // Updating Places document after each review with the number or reviews
  // and the average rating
  if (stats.length > 0) {
    await Place.findByIdAndUpdate(placeId, {
      ratingsQuantity: stats[0].nRating,
      rating: stats[0].avgRating
    });
  } else {
    await Place.findByIdAndUpdate(placeId, {
      ratingsQuantity: 0,
      rating: 4.5
    });
  }
};

reviewSchema.post('save', function() {
  // this points to the current review
  this.constructor.calcRatings(this.place);
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  // console.log(this.r);
  next();
});
reviewSchema.post(/^findOneAnd/, async function() {
  // await this.findOne(); Does NOT work here, query is already executed
  await this.r.constructor.calcRatings(this.r.place);
});
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
