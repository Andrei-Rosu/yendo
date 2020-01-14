const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
  place: {
    type: mongoose.Schema.ObjectId,
    ref: 'Place',
    required: [true, 'Booking must be for an event ! ']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must be done by an user ! ']
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price ! ']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  paid: {
    type: Boolean,
    default: true
  }
});

bookingSchema.pre(/^find/, function(next) {
  this.populate('user').populate({
    path: 'place',
    select: 'name'
  });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
