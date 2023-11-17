const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../modals/userModal');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signInToken = id => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  return token;
};

exports.signUp = catchAsync(async (req, res, next) => {
  const { name, password, passwordConfirm, email } = req.body;
  const newUser = await User.create({
    name,
    password,
    passwordConfirm,
    email
  });
  const token = signInToken(newUser._id);
  return res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Required email && password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Email or Password is incorrect', 401));
  }

  const token = signInToken(user._id);

  return res.status(200).json({
    status: 'Success',
    token
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // get the token is it exist

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Kindly log in to See details', 401));
  }

  // verification the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // check user exist
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError('The User belonging to this token no longer exists', 401)
    );
  }

  // if user changed password after jwt issued

  if (freshUser.correctPassword(decoded.iat)) {
    next(new AppError('Token expired please login again', 401));
  }

  // Access to protected route
  req.user = freshUser;
  next();
});
