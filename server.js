const express = require('express');

const mongoose = require('mongoose');
const dotenv = require('dotenv');

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const appp = next({ dev });
const handle = appp.getRequestHandler();

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION ! Shutting down engines for inspection...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

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

// // Start Server
// const port = process.env.PORT || 3210;
// const server = app.listen(port, () => {
//   console.log(`App running on port ${port}...`);
// });

// process.on('unhandledRejection', err => {
//   console.log(err.name, err.message);
//   console.log('UNHANDLED REJECTION ! Shutting down engines for inspection...');
//   server.close(() => {
//     process.exit(1);
//   });
// });
//
// // Responding to SIGTERM signal from Heroku
// process.on('SIGTERM', () => {
//   console.log('SIGTERM RECEIVED. Shutting down gracefully');
//   server.close(() => {
//     console.log('Process terminated!');
//   });
// });

appp.prepare().then(() => {
  const port = process.env.PORT || 3210;
  const server = express();
  server.get('*', (req, res) => {
    return handle(req, res);
  });
  server.get('/', async (req, res) => {
    res.json({
      title: 'First page',
      otherProps: ''
    });
  });
  server.listen(port, () => {
    console.log(`App running on port ${port}...`);
  });
  process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log(
      'UNHANDLED REJECTION ! Shutting down engines for inspection...'
    );
    server.close(() => {
      process.exit(1);
    });
  });

  // Responding to SIGTERM signal from Heroku
  process.on('SIGTERM', () => {
    console.log('SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
      console.log('Process terminated!');
    });
  });
});
