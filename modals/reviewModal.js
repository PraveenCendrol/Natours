const mongoose = require('mongoose');
const Tour = require('./tourModal');

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
      ref: 'Tours',
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

reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  if (stats.length) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0
    });
  }
};
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.clone().findOne();
  next();
});
reviewSchema.post('save', function() {
  this.constructor.calcAverageRatings(this.tour);
});
reviewSchema.post(/^findOneAnd/, async function() {
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
