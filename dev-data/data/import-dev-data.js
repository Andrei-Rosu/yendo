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

// Read Json file

const places = JSON.parse(
  fs.readFileSync(`${__dirname}/devdbtest.json`, 'utf-8')
);

// Import data into DB

const importData = async () => {
  try {
    await Place.create(places);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
};

// Delete all data from DB

const deleteData = async () => {
  try {
    await Place.deleteMany();
    console.log('Data successfully deleted!');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

// Mac-de-Administrateur:starter administrateur$ node dev-data/data/import-dev-data.js
//   [ '/usr/local/bin/node',
//   '/Applications/MAMP/htdocs/complete-node-bootcamp-master/4-natours/starter/dev-data/data/import-dev-data.js' ]
// DB connection successful!
// ^C
// Mac-de-Administrateur:starter administrateur$ node dev-data/data/import-dev-data.js --import
