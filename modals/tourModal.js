const mongoose = require('mongoose');

const toursSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A Tour musht have a name'],
    unique: true,
    trim: true
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'Max Group size is required']
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty level must be specified']
  },
  ratingsAverage: {
    type: Number,
    default: 0
  },
  ratingQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  },
  discount: {
    type: Number,
    trim: true
  },
  summary: {
    type: String
  },
  description: {
    type: String,
    require: [true, 'A Tour must have a description']
  },
  imageCover: {
    type: String,
    required: [true, 'A Tour must have a cover image']
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now()
  },

  startDate: [Date]
});
const Tour = mongoose.model('Tours', toursSchema);

module.exports = Tour;
