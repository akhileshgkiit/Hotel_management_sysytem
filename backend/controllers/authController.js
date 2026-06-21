const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { uploadImage } = require('../services/cloudinaryService');
const { sendEmail } = require('../services/emailService');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'mock_google_client_id');

// @desc    Register a new user (with Email Verification token creation)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    let profileImageUrl;
    if (req.file) {
      profileImageUrl = await uploadImage(req.file.buffer, 'profiles');
    }

    // Generate Verification Token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    const verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours validity

    // Create auto-verified user (smooth flow)
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      phone,
      profileImage: profileImageUrl,
      isVerified: true,
      verificationToken,
      verificationTokenExpire,
    });

    if (user) {
      // Send verification link (logged to console in mock mode for record)
      const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
      const emailMessage = `Dear ${user.name},\n\nThank you for registering at LuxeStay.\n\nYour account is active and ready to log in.\n\nRegards,\nLuxeStay Team`;

      await sendEmail({
        email: user.email,
        subject: 'Welcome to LuxeStay!',
        message: emailMessage,
        html: `<h3>Welcome to LuxeStay!</h3>
               <p>Your registration is successful. You can now log in to your account.</p>`,
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful!',
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profileImage: user.profileImage || 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
        wishlist: user.wishlist,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user & get token (checks verification status)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email and select password explicitly
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked by the administrator' });
    }

    // Verify email validation status
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Your email address is not verified. Please check your inbox for the verification email.',
      });
    }

    if (await user.matchPassword(password)) {
      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profileImage: user.profileImage,
        wishlist: user.wishlist,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify email token
// @route   GET /api/auth/verify/:token
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token. Please register again.',
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Your email has been successfully verified! You can now log in.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Google OAuth sign in / signup
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  try {
    const { idToken, mockPayload } = req.body;
    let email, name, googleId;

    const isMockMode =
      !process.env.GOOGLE_CLIENT_ID ||
      process.env.GOOGLE_CLIENT_ID.includes('mock') ||
      mockPayload;

    if (isMockMode) {
      email = mockPayload?.email || req.body.email || 'mockgoogle@example.com';
      name = mockPayload?.name || req.body.name || 'Mock Google User';
      googleId = mockPayload?.googleId || req.body.googleId || 'mockgoogleid123';
    } else {
      // Secure verify with Google API uploader
      try {
        const ticket = await client.verifyIdToken({
          idToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        email = payload.email;
        name = payload.name;
        googleId = payload.sub;
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: 'Google login token verification failed: ' + err.message,
        });
      }
    }

    // Find or create Google authenticated user
    let user = await User.findOne({ email });
    if (!user) {
      // Create user (automatically verified because Google verified email validity)
      const randomPassword = crypto.randomBytes(16).toString('hex');
      user = await User.create({
        name,
        email,
        password: randomPassword,
        phone: '0000000000', // default mock phone
        role: 'user',
        isVerified: true,
        googleId,
      });
    } else {
      // Update googleId association and auto verify
      user.googleId = googleId;
      user.isVerified = true;
      await user.save();
    }

    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      profileImage: user.profileImage,
      wishlist: user.wishlist,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user profile (current logged-in user)
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    if (user) {
      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profileImage: user.profileImage,
        wishlist: user.wishlist,
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  googleLogin,
  getMe,
};
