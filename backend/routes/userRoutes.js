const express = require('express');
const router = express.Router();
const {
  updateProfile,
  toggleWishlist,
  getAllUsers,
  toggleBlockUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.put('/profile', protect, upload.single('profileImage'), updateProfile);
router.post('/wishlist', protect, toggleWishlist);

// Admin-only management routes
router.get('/', protect, authorize('admin'), getAllUsers);
router.put('/:id/block', protect, authorize('admin'), toggleBlockUser);

module.exports = router;
