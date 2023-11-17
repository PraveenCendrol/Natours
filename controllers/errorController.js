const AppError = require('../utils/appError');

const handleCastError = err => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateError = err => {
  const value = err.keyValue.name;
  const message = `Duplicat feild value : ${value}`;

  return new AppError(message, 400);
};

const handleValidationError = err => {
  const errors = Object.values(err.errors).map(e => e.message);
  const message = `Invalid input data ${errors}`;

  return new AppError(message, 400);
};

const sendErrorForDev = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack
  });
};

const sendErrorForProd = (err, res) => {
  // if there is an operational error we need intimate client
  console.log('>>>>>>', err);
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }
  // but this is an unknown error so we dont want to leake the details

  return res.status(500).json({
    status: 'error',
    message: 'Something really went wrong'
  });
};

const jsonWebTokenError = () =>
  new AppError('Invalid token please login again', 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  // console.log(err);
  if (process.env.NODE_ENV === 'development') {
    return sendErrorForDev(err, res);
  }
  if (process.env.NODE_ENV === 'production') {
    let error = { ...err, message: err.message };
    console.log('ERROR ===> ', err.name);
    if (err.path) err = handleCastError(err);
    if (err.code === 11000) error = handleDuplicateError(err);
    if (err.name === 'ValidationError') error = handleValidationError(err);
    if (err.name === 'JsonWebTokenError') error = jsonWebTokenError(err);
    if (err.name === 'TokenExpiredError')
      error = new AppError('Token expired kindly login again', 401);
    return sendErrorForProd(error, res);
  }

  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
};
