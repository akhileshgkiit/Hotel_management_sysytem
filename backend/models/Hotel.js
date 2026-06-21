const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema(
  {
    hotelAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hotelName: {
      type: String,
      required: [true, 'Please add a hotel name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
    },
    city: {
      type: String,
      required: [true, 'Please add a city'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'Please add a state'],
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'blocked'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Hotel', hotelSchema);
