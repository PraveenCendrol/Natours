const User = require('../modals/userModal');
// const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  allowedFields.map(e => {
    if (obj[e]) {
      newObj[e] = obj[e];
    }
    return null;
  });

  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // create error if user try to update the password
  if (req.body.password || req.body.passwordConfirm)
    return next(new AppError('You cant update password here', 400));

  const filteredBody = filterObj(req.body, 'name', 'email');

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });
  return res.status(200).json({
    status: 'success',
    message: 'Your account has been updated successfully!',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message:
      'This route is not yet defined! and never will be please use signup instead'
  });
};
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// do nnot use it to chang epassword
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
