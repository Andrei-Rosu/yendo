const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A place must have a name'],
      unique: true,
      maxlength: [40, 'A place name must have less than 41 characters'],
      minlength: [4, 'A place name must have more than 4 characters']
      // Validator with external "validator.js" library - checks alpha
      // validate: [validator.isAlpha, 'Place name must only contain letters']
    },
    slug: {
      type: String
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be bellow 5.0'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // this.price only works on current document on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be bellow regular price'
      }
    },
    mood: {
      type: String,
      required: [
        false,
        'You must set the kinds of mood this place is suitable for'
      ],
      enum: {
        values: [
          'happy',
          'crazy',
          'nostalgic',
          'romantic',
          'blue',
          'energetic'
        ],
        message: 'Mood has to be set to one of the values'
      }
    },
    duration: {
      type: Number,
      default: 0
    },
    website: {
      type: String
    },
    fulladdress: {
      type: String,
      required: [true, 'A place must have an address']
    },
    location: {
      type: String
    },
    latitude: {
      type: Number,
      default: 0
    },
    longitude: {
      type: Number,
      default: 0
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    // secretPlace: {
    //   type: Boolean,
    //   default: false
    // },
    startLocation: {
      // GeoJson
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
// Indexes help improve drastically performance for get requests as they reduce
// the number of documents examined to the sole documents concerned by the query
placeSchema.index({ price: 1, rating: -1 });
placeSchema.index({ slug: 1 });
placeSchema.index({ startLocation: '2dsphere' });

// Virtual
placeSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// Virtual populate
placeSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'place',
  localField: '_id'
});

// Document middleware, runs before the save() command and the .create() --> ONLY --> (not for update)

placeSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Embeding tour guides

// placeSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// placeSchema.pre('save', function(next) {
//   next();
// });
//
// placeSchema.post('save', function(doc, next) {
//   next();
// });

// Query middleware

placeSchema.pre(/^find/, function(next) {
  this.find({ secretPlace: { $ne: true } });
  this.start = Date.now();
  next();
});

placeSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });

  next();
});

// placeSchema.post(/^find/, function(docs, next) {
//   console.log(`Query took ${Date.now() - this.start} milliseconds`);
//   next();
// });

// Aggregation middleware

// placeSchema.pre('aggregate', function(next) {
//   this.pipeline().unshift({ $match: { secretPlace: { $ne: true } } });
//   console.log(this.pipeline());
//   next();
// });

const Place = mongoose.model('Place', placeSchema);

module.exports = Place;
