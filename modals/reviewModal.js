const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A Review should have a review']
    },
    rating: {
      type: Number,
      // required: [true, 'A review should have a rating'],
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must be associated with a Tour']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A review must be associated with a User']
    }
  },
  {
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    }
  }
);

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
