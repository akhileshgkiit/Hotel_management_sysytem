const User = require('../models/User');
const { uploadImage } = require('../services/cloudinaryService');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;

      if (req.body.password) {
        user.password = req.body.password;
      }

      if (req.file) {
        user.profileImage = await uploadImage(req.file.buffer, 'profiles');
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        profileImage: updatedUser.profileImage,
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add/Remove hotel to/from wishlist
// @route   POST /api/users/wishlist
// @access  Private
const toggleWishlist = async (req, res) => {
  try {
    const { hotelId } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const index = user.wishlist.indexOf(hotelId);
    if (index === -1) {
      user.wishlist.push(hotelId);
    } else {
      user.wishlist.splice(index, 1);
    }

    await user.save();
    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users (Super Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle block/unblock status of a user (Super Admin only)
// @route   PUT /api/users/:id/block
// @access  Private/Admin
const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot block/unblock a Super Admin' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      success: true,
      message: `User has been successfully ${user.isBlocked ? 'blocked' : 'unblocked'}`,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  updateProfile,
  toggleWishlist,
  getAllUsers,
  toggleBlockUser,
};
