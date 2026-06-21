const express = require('express');
const router = express.Router();
const {
  addReview,
  getHotelReviews,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/hotel/:hotelId', getHotelReviews);
router.post('/', protect, addReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
