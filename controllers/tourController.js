const Tour = require('../modals/tourModal');
const APIFeatures = require('../utils/apiFeatures');

exports.aliasTopTours = (req, res, next) => {
  // Limit query results to 5
  req.query.limit = 5;

  // Sort by ratings average in descending order and price
  req.query.sort = '-ratingsAverage,price';

  // Define fields to return in query results
  req.query.fields = 'name,price,difficulty,summary,ratingsAverage';

  next();
};

exports.getAllTours = async (req, res) => {
  try {
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
  } catch (error) {
    // send response with error status
    res.status(400).json({
      status: 'Failed',
      message: error
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'Faliled',
      message: error
    });
  }
  // const tour = tours.find(el => el.id === id);
};

exports.createTour = async (req, res) => {
  // console.log(req.body);

  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'failed',
      message: error
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    return res.status(200).json({
      status: 'success',
      data: {
        tour: tour
      }
    });
  } catch (error) {
    return res.status(400).json({
      status: 'failed',
      message: error
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const deleted = await Tour.findByIdAndDelete(req.params.id);

    return res.status(204).json({
      status: 'success',
      data: deleted
    });
  } catch (error) {
    return res.status(400).json({
      status: 'faliled',
      message: error
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
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
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      status: 'failed',
      message: error
    });
  }
};

exports.getMonthlyplan = async (req, res) => {
  try {
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
  } catch (error) {
    return res.status(404).json({
      status: 'failed',
      message: error
    });
  }
};
