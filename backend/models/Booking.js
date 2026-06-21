const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
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
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    checkInDate: {
      type: Date,
      required: [true, 'Please add a check-in date'],
    },
    checkOutDate: {
      type: Date,
      required: [true, 'Please add a check-out date'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Please specify the total amount'],
    },
    bookingStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Checked In', 'Checked Out', 'Cancelled'],
      default: 'Pending',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    paymentMethod: {
      type: String,
      enum: ['None', 'Razorpay', 'eSewa', 'Khalti'],
      default: 'None',
    },
    transactionId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
