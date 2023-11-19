const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../modals/userModal');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signInToken = id => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  return token;
};

const createAndSendToken = (user, res, statuscode) => {
  const token = signInToken(user._id);
  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOption.secure = true;
  res.cookie('jwt', token, cookieOption);
  user.password = undefined;
  return res.status(statuscode).json({
    status: 'success',
    token,
    data: {
      user: user
    }
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const { name, password, passwordConfirm, email, role } = req.body;
  const newUser = await User.create({
    name,
    password,
    passwordConfirm,
    email,
    role
  });
  createAndSendToken(newUser, res, 201);
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

  createAndSendToken(user, res, 200);
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

  if (freshUser.changedPasswordAfter(decoded.iat)) {
    next(new AppError('Token expired please login again', 401));
  }

  // Access to protected route
  req.user = freshUser;
  next();
});

exports.restictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new AppError("You don't have permission to do it", 403));

    return next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // get user based on email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with the email', 404));
  }
  // generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // send it in email

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forget password submit new request via : ${resetURL}`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'password valid for 10 mins',
      message
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email try again later', 500)
    );
  }

  return res.status(200).json({
    status: 'success',
    data: 'token sent to your email'
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gt: Date.now() }
  });
  // if token not expired and there is a user set new password
  if (!user) {
    return next(new AppError('Token is invalid or expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;

  await user.save();
  // update changepassword at for the user
  createAndSendToken(user, res, 200);

  // login the user send the jwt
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // get user from collection

  const user = await User.findById(req.user.id).select('+password');

  if (!user) return next(new AppError('User not found ', 400));

  // previous password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }

  // if so update password

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // LOg in user with jwt

  createAndSendToken(user, res, 200);
});
