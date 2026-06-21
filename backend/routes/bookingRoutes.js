const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.get('/mybookings', protect, getMyBookings);
router.get('/hotel', protect, authorize('hotelAdmin'), getHotelBookings);
router.get('/admin/all', protect, authorize('admin'), getAllBookings);
router.get('/:id', protect, getBookingById);

router.put('/:id/status', protect, authorize('hotelAdmin'), updateBookingStatus);
router.put('/:id/cancel', protect, cancelBooking);

// Payment Integration Routes
router.post('/:id/initiate-esewa', protect, initiateEsewa);
router.post('/:id/verify-esewa', protect, verifyEsewa);
router.post('/:id/initiate-khalti', protect, initiateKhalti);
router.post('/:id/verify-khalti', protect, verifyKhalti);
router.post('/:id/pay-mock', protect, completeMockPayment);

module.exports = router;

