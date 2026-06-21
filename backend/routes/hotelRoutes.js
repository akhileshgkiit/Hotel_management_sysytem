const express = require('express');
const router = express.Router();
const {
  registerHotel,
  updateHotelProfile,
  getMyHotel,
  searchHotels,
  getHotelDetails,
  getAllHotels,
  updateHotelStatus,
} = require('../controllers/hotelController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', searchHotels);
router.get('/myhotel', protect, authorize('hotelAdmin'), getMyHotel);
router.get('/admin/all', protect, authorize('admin'), getAllHotels);
router.get('/:id', getHotelDetails);

router.post('/', protect, authorize('hotelAdmin'), registerHotel);
router.put('/profile', protect, authorize('hotelAdmin'), upload.array('images', 5), updateHotelProfile);
router.put('/:id/status', protect, authorize('admin'), updateHotelStatus);

module.exports = router;
