const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Place = require('./../../models/placeModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB connection successful!'));
Place.find().then(places => {
  places.forEach(function(place) {
    place.update(
      { _id: place._id },
      {
        $set: {
          startLocation: {
            // GeoJson
            type: {
              type: String,
              default: 'Point',
              enum: ['Point']
            },
            coordinates: ['$longitude', '$latitude'],
            address: String,
            description: String
          }
        }
      }
    );
  });
});
