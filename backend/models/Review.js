const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please add a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please add a comment'],
    },
  },
  {
    timestamps: true,
  }
);

// Recalculate average rating of hotel when review is saved
reviewSchema.statics.calculateAverageRating = async function (hotelId) {
  const stats = await this.aggregate([
    {
      $match: { hotelId: hotelId },
    },
    {
      $group: {
        _id: '$hotelId',
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  try {
    if (stats.length > 0) {
      await this.model('Hotel').findByIdAndUpdate(hotelId, {
        rating: Math.round(stats[0].averageRating * 10) / 10,
      });
    } else {
      await this.model('Hotel').findByIdAndUpdate(hotelId, {
        rating: 0,
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call calculateAverageRating after save
reviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.hotelId);
});

// Call calculateAverageRating before delete
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.hotelId);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
