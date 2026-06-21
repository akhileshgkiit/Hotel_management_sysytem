const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');
const crypto = require('crypto');

/**
 * Helper to check room availability during a date range
 * @param {String} roomId 
 * @param {Date} checkIn 
 * @param {Date} checkOut 
 * @returns {Promise<Boolean>} True if available
 */
const checkRoomAvailability = async (roomId, checkIn, checkOut) => {
  const room = await Room.findById(roomId);
  if (!room) return false;

  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);

  // Find all active bookings overlapping with dates
  const overlappingBookings = await Booking.find({
    roomId,
    bookingStatus: { $in: ['Pending', 'Confirmed', 'Checked In'] },
    $or: [
      { checkInDate: { $lt: outDate }, checkOutDate: { $gt: inDate } }
    ]
  });

  // If active bookings count is less than total inventory, it is available
  return overlappingBookings.length < room.availableRooms;
};

// @desc    Create a booking / Check availability / Order mock or real
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate, skipPayment } = req.body;

    const room = await Room.findById(roomId).populate('hotelId');
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room category not found' });
    }

    // 1. Check availability
    const isAvailable = await checkRoomAvailability(roomId, checkInDate, checkOutDate);
    if (!isAvailable) {
      return res.status(400).json({ success: false, message: 'No rooms of this type are available for the selected dates.' });
    }

    // 2. Calculate amount
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffTime = Math.abs(checkOut - checkIn);
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const totalAmount = room.price * nights;

    // 3. Create booking
    // Since payment is skipped for now, we immediately mark it as Paid and bookingStatus as Pending
    const isPaidImmediate = skipPayment !== false; // Default is true since user requested skip payment

    const booking = await Booking.create({
      userId: req.user._id,
      hotelId: room.hotelId._id,
      roomId: room._id,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalAmount,
      bookingStatus: 'Pending',
      paymentStatus: isPaidImmediate ? 'Paid' : 'Pending',
      razorpayOrderId: isPaidImmediate ? 'mock_order_' + Date.now() : undefined,
    });

    // Fetch user email to send confirmation log
    const user = await User.findById(req.user._id);

    // Send confirmation email
    await sendEmail({
      email: user.email,
      subject: `Hotel Booking Request Placed - ${room.hotelId.hotelName}`,
      message: `Dear ${user.name},\n\nYour booking request for a ${room.roomType} at ${room.hotelId.hotelName} from ${checkIn.toDateString()} to ${checkOut.toDateString()} has been placed successfully.\n\nTotal Paid: Rs. ${totalAmount}\nBooking Status: Pending Approval\n\nThank you for using our Hotel Booking System.`,
    });

    res.status(201).json({
      success: true,
      message: 'Booking request created successfully. Awaiting admin confirmation.',
      booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's booking history
// @route   GET /api/bookings/mybookings
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('hotelId', 'hotelName address city state images')
      .populate('roomId', 'roomType price')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get bookings of a hotel (Hotel Admin)
// @route   GET /api/bookings/hotel
// @access  Private/HotelAdmin
const getHotelBookings = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ hotelAdmin: req.user._id });
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel profile not found' });
    }

    const bookings = await Booking.find({ hotelId: hotel._id })
      .populate('userId', 'name email phone')
      .populate('roomId', 'roomType price')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update booking status (Hotel Admin)
// @route   PUT /api/bookings/:id/status
// @access  Private/HotelAdmin
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Confirmed', 'Checked In', 'Checked Out', 'Cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status update request' });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('hotelId', 'hotelName hotelAdmin');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify hotel ownership
    if (booking.hotelId.hotelAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage bookings for this hotel' });
    }

    booking.bookingStatus = status;

    // Handle refund status if booking is cancelled after being paid
    if (status === 'Cancelled' && booking.paymentStatus === 'Paid') {
      booking.paymentStatus = 'Refunded';
    }

    await booking.save();

    // Send status update email to the user
    await sendEmail({
      email: booking.userId.email,
      subject: `Booking Status Updated - ${booking.hotelId.hotelName}`,
      message: `Dear ${booking.userId.name},\n\nThe status of your booking at ${booking.hotelId.hotelName} has been updated to: ${status}.\n\nCheck-in Date: ${new Date(booking.checkInDate).toDateString()}\n\nThank you for choosing us.`,
    });

    res.json({ success: true, message: `Booking status updated to ${status}`, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel a booking (Customer self)
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('hotelId', 'hotelName');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify booking belongs to user
    if (booking.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    // Check-in check: Cannot cancel if already checked-in or checked-out
    if (['Checked In', 'Checked Out', 'Cancelled'].includes(booking.bookingStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking that is already ${booking.bookingStatus}`,
      });
    }

    // Cancellation policy: Free cancellation allowed before check-in date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(booking.checkInDate);
    checkIn.setHours(0, 0, 0, 0);

    if (today >= checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation is only allowed prior to the check-in date.',
      });
    }

    booking.bookingStatus = 'Cancelled';
    if (booking.paymentStatus === 'Paid') {
      booking.paymentStatus = 'Refunded';
    }

    await booking.save();

    // Send cancellation email
    await sendEmail({
      email: booking.userId.email,
      subject: `Booking Cancelled - ${booking.hotelId.hotelName}`,
      message: `Dear ${booking.userId.name},\n\nYour booking at ${booking.hotelId.hotelName} has been cancelled successfully.\n\nYour payment status is updated to Refunded (if applicable).\n\nRegards,\nHotel Booking Team`,
    });

    res.json({ success: true, message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bookings (Super Admin only)
// @route   GET /api/bookings/admin/all
// @access  Private/Admin
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('userId', 'name email phone')
      .populate('hotelId', 'hotelName address city state')
      .populate('roomId', 'roomType price')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Initiate eSewa payment (generate signature)
// @route   POST /api/bookings/:id/initiate-esewa
// @access  Private
const initiateEsewa = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('hotelId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const totalAmount = booking.totalAmount;
    const transactionUuid = `${booking._id}-${Date.now()}`;
    const productCode = process.env.ESEWA_MERCHANT_CODE || 'EPAYTEST';
    const secretKey = process.env.ESEWA_SECRET_KEY || '8g8M8JADtZYCQY5Y';

    // Signature formula: total_amount,transaction_uuid,product_code signed with secret key
    const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(message);
    const signature = hmac.digest('base64');

    res.json({
      success: true,
      paymentData: {
        amount: totalAmount,
        tax_amount: 0,
        total_amount: totalAmount,
        transaction_uuid: transactionUuid,
        product_code: productCode,
        product_service_charge: 0,
        product_delivery_charge: 0,
        success_url: `${req.headers.origin || 'http://localhost:5173'}/checkout/success-esewa`,
        failure_url: `${req.headers.origin || 'http://localhost:5173'}/checkout/failure`,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature,
      },
      gatewayUrl: process.env.ESEWA_GATEWAY_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify eSewa payment
// @route   POST /api/bookings/:id/verify-esewa
// @access  Private
const verifyEsewa = async (req, res) => {
  try {
    const { data } = req.body; // base64 encoded JSON string returned by eSewa
    if (!data) {
      return res.status(400).json({ success: false, message: 'Missing payment data' });
    }

    // Decode base64 data
    const decodedString = Buffer.from(data, 'base64').toString('utf-8');
    const paymentResult = JSON.parse(decodedString);

    const {
      transaction_code,
      status,
      total_amount,
      transaction_uuid,
      product_code,
      signed_field_names,
      signature
    } = paymentResult;

    if (status !== 'COMPLETE') {
      return res.status(400).json({ success: false, message: 'Payment status is not COMPLETE' });
    }

    // Reconstruct message to verify signature
    const secretKey = process.env.ESEWA_SECRET_KEY || '8g8M8JADtZYCQY5Y';
    const fields = signed_field_names.split(',');
    const messageParts = fields.map(field => `${field}=${paymentResult[field]}`);
    const message = messageParts.join(',');

    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(message);
    const calculatedSignature = hmac.digest('base64');

    if (calculatedSignature !== signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Update booking in database
    const booking = await Booking.findById(req.params.id).populate('userId hotelId roomId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.paymentStatus = 'Paid';
    booking.paymentMethod = 'eSewa';
    booking.transactionId = transaction_code;
    await booking.save();

    // Send confirmation email
    try {
      await sendEmail({
        email: booking.userId.email,
        subject: `Payment Received - Booking Confirmed - ${booking.hotelId.hotelName}`,
        message: `Dear ${booking.userId.name},\n\nWe have received your payment of Rs. ${booking.totalAmount} via eSewa.\n\nYour booking request for a ${booking.roomId.roomType} at ${booking.hotelId.hotelName} from ${booking.checkInDate.toDateString()} to ${booking.checkOutDate.toDateString()} is now confirmed.\n\nTransaction ID: ${transaction_code}\n\nThank you for choosing us!`,
      });
    } catch (mailError) {
      console.error('Email sending failed on payment verification:', mailError);
    }

    res.json({ success: true, message: 'Payment verified successfully', booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Initiate Khalti payment
// @route   POST /api/bookings/:id/initiate-khalti
// @access  Private
const initiateKhalti = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('hotelId userId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const totalAmount = booking.totalAmount;
    const amountInPaisa = Math.round(totalAmount * 100); // Khalti requires amount in paisa
    const returnUrl = `${req.headers.origin || 'http://localhost:5173'}/checkout/success-khalti`;
    
    // Call Khalti initiate endpoint
    const khaltiKey = process.env.KHALTI_SECRET_KEY || 'Key e5896b0266014ecba9748b61c28c89b0';
    const khaltiUrl = `${process.env.KHALTI_GATEWAY_URL || 'https://a.khalti.com/api/v2'}/epayment/initiate/`;

    const requestBody = {
      return_url: returnUrl,
      website_url: req.headers.origin || 'http://localhost:5173',
      amount: amountInPaisa,
      purchase_order_id: booking._id.toString(),
      purchase_order_name: `Hotel Booking - ${booking.hotelId.hotelName}`,
      customer_info: {
        name: booking.userId.name || 'Guest User',
        email: booking.userId.email || 'guest@example.com',
        phone: booking.userId.phone || '9800000000',
      }
    };

    let pidx, payment_url;
    try {
      const response = await fetch(khaltiUrl, {
        method: 'POST',
        headers: {
          'Authorization': khaltiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();
      if (response.ok && responseData.pidx) {
        pidx = responseData.pidx;
        payment_url = responseData.payment_url;
      } else {
        throw new Error(responseData.detail || 'Khalti API initialization failed');
      }
    } catch (apiError) {
      console.warn('Khalti API initiation failed, falling back to simulated sandbox session:', apiError.message);
      // Fallback: Generate mock UAT details for seamless testing offline
      pidx = 'mock_pidx_' + Math.random().toString(36).substring(2, 15);
      payment_url = `${req.headers.origin || 'http://localhost:5173'}/checkout/success-khalti?pidx=${pidx}&amount=${amountInPaisa}&purchase_order_id=${booking._id}`;
    }

    res.json({
      success: true,
      pidx,
      payment_url,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Khalti payment
// @route   POST /api/bookings/:id/verify-khalti
// @access  Private
const verifyKhalti = async (req, res) => {
  try {
    const { pidx } = req.body;
    if (!pidx) {
      return res.status(400).json({ success: false, message: 'Missing pidx parameter' });
    }

    const booking = await Booking.findById(req.params.id).populate('userId hotelId roomId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check if it is a mock pidx
    if (pidx.startsWith('mock_pidx_')) {
      booking.paymentStatus = 'Paid';
      booking.paymentMethod = 'Khalti';
      booking.transactionId = 'mock_txn_' + Date.now();
      await booking.save();

      // Send confirmation email
      try {
        await sendEmail({
          email: booking.userId.email,
          subject: `Payment Received - Booking Confirmed - ${booking.hotelId.hotelName}`,
          message: `Dear ${booking.userId.name},\n\nWe have received your payment of Rs. ${booking.totalAmount} via Khalti.\n\nYour booking request for a ${booking.roomId.roomType} at ${booking.hotelId.hotelName} from ${booking.checkInDate.toDateString()} to ${booking.checkOutDate.toDateString()} is now confirmed.\n\nTransaction ID: ${booking.transactionId}\n\nThank you for choosing us!`,
        });
      } catch (mailError) {
        console.error('Email sending failed on payment verification:', mailError);
      }

      return res.json({ success: true, message: 'Mock payment verified successfully', booking });
    }

    // Call Khalti verification status endpoint
    const khaltiKey = process.env.KHALTI_SECRET_KEY || 'Key e5896b0266014ecba9748b61c28c89b0';
    const lookupUrl = `${process.env.KHALTI_GATEWAY_URL || 'https://a.khalti.com/api/v2'}/epayment/lookup/`;

    try {
      const response = await fetch(lookupUrl, {
        method: 'POST',
        headers: {
          'Authorization': khaltiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pidx }),
      });

      const responseData = await response.json();

      if (response.ok && responseData.status === 'Completed') {
        booking.paymentStatus = 'Paid';
        booking.paymentMethod = 'Khalti';
        booking.transactionId = responseData.transaction_id || responseData.pidx;
        await booking.save();

        // Send confirmation email
        try {
          await sendEmail({
            email: booking.userId.email,
            subject: `Payment Received - Booking Confirmed - ${booking.hotelId.hotelName}`,
            message: `Dear ${booking.userId.name},\n\nWe have received your payment of Rs. ${booking.totalAmount} via Khalti.\n\nYour booking request for a ${booking.roomId.roomType} at ${booking.hotelId.hotelName} from ${booking.checkInDate.toDateString()} to ${booking.checkOutDate.toDateString()} is now confirmed.\n\nTransaction ID: ${booking.transactionId}\n\nThank you for choosing us!`,
          });
        } catch (mailError) {
          console.error('Email sending failed on payment verification:', mailError);
        }

        return res.json({ success: true, message: 'Payment verified successfully', booking });
      } else {
        return res.status(400).json({
          success: false,
          message: responseData.status || 'Khalti payment verification failed',
        });
      }
    } catch (apiError) {
      return res.status(500).json({ success: false, message: 'Error checking Khalti payment status: ' + apiError.message });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Direct Simulated Payment bypass
// @route   POST /api/bookings/:id/pay-mock
// @access  Private
const completeMockPayment = async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    if (!['eSewa', 'Khalti'].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Invalid payment method for mock flow' });
    }

    const booking = await Booking.findById(req.params.id).populate('userId hotelId roomId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.paymentStatus = 'Paid';
    booking.paymentMethod = paymentMethod;
    booking.transactionId = `mock_${paymentMethod.toLowerCase()}_${Date.now()}`;
    await booking.save();

    // Send confirmation email
    try {
      await sendEmail({
        email: booking.userId.email,
        subject: `Payment Received - Booking Confirmed - ${booking.hotelId.hotelName}`,
        message: `Dear ${booking.userId.name},\n\nWe have received your simulated payment of Rs. ${booking.totalAmount} via ${paymentMethod}.\n\nYour booking request for a ${booking.roomId.roomType} at ${booking.hotelId.hotelName} from ${booking.checkInDate.toDateString()} to ${booking.checkOutDate.toDateString()} is now confirmed.\n\nTransaction ID: ${booking.transactionId}\n\nThank you for choosing us!`,
      });
    } catch (mailError) {
      console.error('Email sending failed on mock payment verification:', mailError);
    }

    res.json({ success: true, message: `${paymentMethod} payment completed successfully (Simulated)`, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('hotelId', 'hotelName address city state images')
      .populate('roomId', 'roomType price capacity');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify authorized user
    const isCustomer = booking.userId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    let isHotelAdmin = false;
    
    if (req.user.role === 'hotelAdmin') {
      const hotel = await Hotel.findOne({ hotelAdmin: req.user._id });
      if (hotel && booking.hotelId._id.toString() === hotel._id.toString()) {
        isHotelAdmin = true;
      }
    }

    if (!isCustomer && !isAdmin && !isHotelAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getHotelBookings,
  updateBookingStatus,
  cancelBooking,
  getAllBookings,
  initiateEsewa,
  verifyEsewa,
  initiateKhalti,
  verifyKhalti,
  completeMockPayment,
  getBookingById,
};

