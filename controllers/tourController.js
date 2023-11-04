const Tour = require('../modals/tourModal');

exports.getAllTours = async (req, res) => {
  try {
    // const tours = await Tour.find({
    //   duration: 5,
    //   difficulty: 'easy'
    // });
    // console.log(req.query);
    const queryObj = { ...req.query };
    const excludedFeilds = ['page', 'sort', 'limit', 'fields'];

    excludedFeilds.forEach(e => delete queryObj[e]);
    const queryStr = JSON.stringify(queryObj);
    const updatedStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, e => `$${e}`);
    const parsedString = JSON.parse(updatedStr);
    // advance fileterinf

    let query = Tour.find(parsedString);

    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // pagination

    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page dose not exist');
    }

    // executing query
    const tours = await query;

    // send response
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours
      }
    });
  } catch (error) {
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
