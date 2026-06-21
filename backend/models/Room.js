const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    roomType: {
      type: String,
      required: [true, 'Please specify the room type'],
      enum: ['Single Room', 'Double Room', 'Deluxe Room', 'Suite Room'],
    },
    description: {
      type: String,
      required: [true, 'Please add a room description'],
    },
    price: {
      type: Number,
      required: [true, 'Please add room price per night'],
    },
    capacity: {
      type: Number,
      required: [true, 'Please specify the maximum capacity'],
    },
    images: {
      type: [String],
      default: [],
    },
    availableRooms: {
      type: Number,
      required: [true, 'Please specify the number of available rooms'],
      min: [0, 'Available rooms cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Room', roomSchema);
