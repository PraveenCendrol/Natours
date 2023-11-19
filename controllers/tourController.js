const Tour = require('../modals/tourModal');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.aliasTopTours = (req, res, next) => {
  // Limit query results to 5
  req.query.limit = 5;

  // Sort by ratings average in descending order and price
  req.query.sort = '-ratingsAverage,price';

  // Define fields to return in query results
  req.query.fields = 'name,price,difficulty,summary,ratingsAverage';

  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  // fetch tours data with filters
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination();
  const tours = await features.query;

  // send response with success status
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) {
    return next(new AppError('No Tour found with that id', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });

  // const tour = tours.find(el => el.id === id);
});

exports.createTour = catchAsync(async (req, res, next) => {
  // console.log(req.body);

  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!tour) {
    return next(new AppError('No Tour found with that id', 404));
  }

  return res.status(200).json({
    status: 'success',
    data: {
      tour: tour
    }
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const deleted = await Tour.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return next(new AppError('No Tour found with that id', 404));
  }
  return res.status(204).json({
    status: 'success',
    data: deleted
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        num: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: -1 }
    },
    {
      $match: {
        _id: { $ne: 'EASY' }
      }
    }
  ]);
  return res.status(200).json({
    status: 'success',
    data: stats
  });
});

exports.getMonthlyplan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: {
          $month: '$startDates'
        },
        numOfToursStarts: { $sum: 1 },
        tours: {
          $push: '$name'
        }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: { _id: 0 }
    },
    {
      $sort: {
        numOfToursStarts: -1
      }
    },
    {
      $limit: 3
    }
  ]);
  return res.status(200).json({
    status: 'Success',
    message: plan
  });
});
