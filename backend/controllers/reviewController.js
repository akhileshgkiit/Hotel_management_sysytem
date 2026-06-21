const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');

// @desc    Add a review for a hotel
// @route   POST /api/reviews
// @access  Private
const addReview = async (req, res) => {
  try {
    const { hotelId, rating, comment } = req.body;

    // Check if hotel exists
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    // Security: Check if user has booked this hotel before allowing a review
    const verifiedStay = await Booking.findOne({
      userId: req.user._id,
      hotelId: hotelId,
      bookingStatus: { $in: ['Checked In', 'Checked Out', 'Confirmed'] },
    });

    if (!verifiedStay) {
      return res.status(400).json({
        success: false,
        message: 'You can only review hotels where you have a verified booking (Confirmed, Checked In, or Checked Out).',
      });
    }

    // Check if user already reviewed this hotel
    const alreadyReviewed = await Review.findOne({
      userId: req.user._id,
      hotelId: hotelId,
    });

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this hotel.',
      });
    }

    const review = await Review.create({
      userId: req.user._id,
      hotelId,
      rating: parseFloat(rating),
      comment,
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get reviews for a hotel
// @route   GET /api/reviews/hotel/:hotelId
// @access  Public
const getHotelReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ hotelId: req.params.hotelId })
      .populate('userId', 'name profileImage')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check ownership or if Super Admin
    if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(req.params.id);

    // Recompute hotel rating
    await Review.calculateAverageRating(review.hotelId);

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addReview,
  getHotelReviews,
  deleteReview,
};
