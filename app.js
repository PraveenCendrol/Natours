const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const mongoSanitize = require('express-mongo-sanitize');
const { default: helmet } = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const errorController = require('./controllers/errorController');

const app = express();

// 1) Global MIDDLEWARES
// logs
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP please try again after 1 hour'
});
// security http
app.use(helmet());
// limit controller
app.use('/api', limiter);
// body parser
app.use(express.json({ limit: '10kb' }));
// data sanitisation against noSql query injection
app.use(mongoSanitize());

// xss input

app.use(xss());

// for serving static files
app.use(express.static(`${__dirname}/public`));

// parameter pollution fixer
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'price',
      'maxGroupSize',
      'difficulty'
    ]
  })
);
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(
    new AppError(`Api not found ${req.originalUrl} check the rout again`, 404)
  );
});
app.use(errorController);

module.exports = app;
