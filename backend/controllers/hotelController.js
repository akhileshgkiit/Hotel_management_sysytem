const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const { uploadImage } = require('../services/cloudinaryService');

// @desc    Register a new hotel (Hotel Admin)
// @route   POST /api/hotels
// @access  Private/HotelAdmin
const registerHotel = async (req, res) => {
  try {
    const { hotelName, description, address, city, state, amenities } = req.body;

    // Check if admin already has a hotel registered
    const existingHotel = await Hotel.findOne({ hotelAdmin: req.user._id });
    if (existingHotel) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered a hotel. You can manage your hotel profile instead.',
      });
    }

    const parsedAmenities = Array.isArray(amenities)
      ? amenities
      : amenities
      ? amenities.split(',').map((a) => a.trim())
      : [];

    const hotel = await Hotel.create({
      hotelAdmin: req.user._id,
      hotelName,
      description,
      address,
      city,
      state,
      amenities: parsedAmenities,
      status: 'pending', // Requires Super Admin approval
    });

    res.status(201).json({ success: true, hotel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update hotel details (Hotel Admin)
// @route   PUT /api/hotels/profile
// @access  Private/HotelAdmin
const updateHotelProfile = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ hotelAdmin: req.user._id });
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel profile not found' });
    }

    const { hotelName, description, address, city, state, amenities } = req.body;

    hotel.hotelName = hotelName || hotel.hotelName;
    hotel.description = description || hotel.description;
    hotel.address = address || hotel.address;
    hotel.city = city || hotel.city;
    hotel.state = state || hotel.state;

    if (amenities) {
      hotel.amenities = Array.isArray(amenities)
        ? amenities
        : amenities.split(',').map((a) => a.trim());
    }

    // Handle image uploads if any files are present
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => uploadImage(file.buffer, 'hotels'));
      const uploadedUrls = await Promise.all(uploadPromises);
      hotel.images = [...hotel.images, ...uploadedUrls];
    }

    await hotel.save();
    res.json({ success: true, hotel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get hotel profile (Hotel Admin self property)
// @route   GET /api/hotels/myhotel
// @access  Private/HotelAdmin
const getMyHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ hotelAdmin: req.user._id });
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'No hotel profile found for this admin' });
    }
    res.json({ success: true, hotel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search/List hotels (Public)
// @route   GET /api/hotels
// @access  Public
const searchHotels = async (req, res) => {
  try {
    const { city, location, priceMin, priceMax, rating, amenities } = req.query;
    const query = { status: 'approved' }; // Only show approved hotels to users

    // Search by city
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    // Search by general location/address
    if (location) {
      query.$or = [
        { address: { $regex: location, $options: 'i' } },
        { city: { $regex: location, $options: 'i' } },
        { state: { $regex: location, $options: 'i' } },
      ];
    }

    // Search by Rating (GTE)
    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    // Search by Amenities
    if (amenities) {
      const amenitiesList = Array.isArray(amenities)
        ? amenities
        : amenities.split(',').map((a) => a.trim());
      query.amenities = { $all: amenitiesList };
    }

    // Search by Price Range (filters rooms and gathers match hotelIds)
    if (priceMin || priceMax) {
      const roomQuery = {};
      if (priceMin) roomQuery.price = { $gte: parseFloat(priceMin) };
      if (priceMax) {
        roomQuery.price = roomQuery.price
          ? { ...roomQuery.price, $lte: parseFloat(priceMax) }
          : { $lte: parseFloat(priceMax) };
      }

      const matchingRooms = await Room.find(roomQuery).select('hotelId');
      const hotelIds = matchingRooms.map((room) => room.hotelId);
      query._id = { $in: hotelIds };
    }

    const hotels = await Hotel.find(query);
    res.json({ success: true, count: hotels.length, hotels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get hotel details (Public)
// @route   GET /api/hotels/:id
// @access  Public
const getHotelDetails = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    // Find rooms and reviews for this hotel
    const rooms = await Room.find({ hotelId: hotel._id });

    res.json({ success: true, hotel, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all hotels (Super Admin only)
// @route   GET /api/hotels/admin/all
// @access  Private/Admin
const getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({}).populate('hotelAdmin', 'name email phone');
    res.json({ success: true, hotels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve/Reject hotel registration (Super Admin only)
// @route   PUT /api/hotels/:id/status
// @access  Private/Admin
const updateHotelStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'blocked', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    hotel.status = status;
    await hotel.save();

    res.json({
      success: true,
      message: `Hotel status has been updated to '${status}'`,
      hotel,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerHotel,
  updateHotelProfile,
  getMyHotel,
  searchHotels,
  getHotelDetails,
  getAllHotels,
  updateHotelStatus,
};
