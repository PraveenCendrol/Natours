const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document found with that id', 404));
    }
    return res.status(204).json({
      status: 'success',
      data: doc
    });
  });

exports.updateOne = Modal =>
  catchAsync(async (req, res, next) => {
    const doc = await Modal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) {
      return next(new AppError('No Document found with that id', 404));
    }

    return res.status(200).json({
      status: 'success',
      data: doc
    });
  });

exports.createOne = Modal =>
  catchAsync(async (req, res, next) => {
    // console.log(req.body);

    const doc = await Modal.create(req.body);
    res.status(201).json({
      status: 'success',
      data: doc
    });
  });

exports.getOne = (Modal, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Modal.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc) {
      return next(new AppError('No Document found with that id', 404));
    }
    res.status(200).json({
      status: 'success',
      data: doc
    });
  });

exports.getAll = Modal =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) {
      filter = { tour: req.params.tourId };
    }

    // fetch tours data with filters
    const features = new APIFeatures(Modal.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();
    const doc = await features.query;

    // send response with success status
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc
      }
    });
  });
