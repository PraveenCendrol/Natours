const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const toursSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A Tour musht have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour lenght must not exceed 40 characters'],
      minlength: [10, 'A tour name must be Longer than 10 characters']
    },
    slug: {
      type: String
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
      required: [true, 'Difficulty level must be specified'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty should be either easy medium or deifficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [1.0, 'Rating must be above 1'],
      max: [5.0, 'Rating must not exceed 5.0']
    },
    ratingQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // this will only work only when creating a new document
          return val < this.price;
        },
        message: 'Discount Price ({VALUE}) should be below the regular price'
      }
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
      default: Date.now(),
      select: false
    },

    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
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

toursSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

toursSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

toursSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });

  next();
});

// toursSchema.post(/^find/, function(docs, next) {});

// Aggrigation middle ware
toursSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

// toursSchema.pre('find', function() {
//   this.find({ secretTour: { $ne: true } });
// });
// toursSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });
const Tour = mongoose.model('Tours', toursSchema);

module.exports = Tour;
