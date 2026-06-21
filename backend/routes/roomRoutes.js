const express = require('express');
const router = express.Router();
const {
  addRoom,
  updateRoom,
  deleteRoom,
  getRoomsByHotel,
} = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/hotel/:hotelId', getRoomsByHotel);

router.post('/', protect, authorize('hotelAdmin'), upload.array('images', 5), addRoom);
router.put('/:id', protect, authorize('hotelAdmin'), upload.array('images', 5), updateRoom);
router.delete('/:id', protect, authorize('hotelAdmin'), deleteRoom);

module.exports = router;
