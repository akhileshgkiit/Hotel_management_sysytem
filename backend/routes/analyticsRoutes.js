const express = require('express');
const router = express.Router();
const { getHotelAnalytics, getAdminAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/hotel', protect, authorize('hotelAdmin'), getHotelAnalytics);
router.get('/admin', protect, authorize('admin'), getAdminAnalytics);

module.exports = router;
