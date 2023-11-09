const express = require('express');

const helmet = require('helmet');
const path = require('path');
const cors = require('cors');

const cookieParser = require('cookie-parser');

const helpers = require('./helpers');

const indexRouter = require('./routes/index');

const errorHandlers = require('./handlers/errorHandlers');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const whitelist = [];

if (process.env.NODE_ENV == 'development') whitelist.push('http://127.0.0.1:8002/');

var corsOptions = {
  origin: function (origin, callback) {
    console.log(`origin : ${origin}`);
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  //origin: true,
  credentials: true
}

// setting cors at one place for all the routes
// putting cors as first in order to avoid unneccessary requests from unallowed origins
// app.use(function (req, res, next) {
//   if (req.url.includes('/api')) {
//     cors(corsOptions)(req, res, next);
//   } else {
//     cors()(req, res, next);
//   }
// });
app.use(function (req, res, next) {
  cors(corsOptions)(req, res, next);
});

app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.locals.h = helpers;  
  res.locals.currentPath = req.path;
  next();
});

app.use('/', indexRouter);

app.use(errorHandlers.notFound);

if (app.get('env') === 'development') {
  /* Development Error Handler - Prints stack trace */
  app.use(errorHandlers.developmentErrors);
}

// production error handler
app.use(errorHandlers.productionErrors);

// done! we export it so we can start the site in start.js
module.exports = app;