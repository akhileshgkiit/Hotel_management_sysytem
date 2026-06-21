const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const { uploadImage } = require('../services/cloudinaryService');

// @desc    Add a room category to hotel (Hotel Admin)
// @route   POST /api/rooms
// @access  Private/HotelAdmin
const addRoom = async (req, res) => {
  try {
    const { roomType, description, price, capacity, availableRooms } = req.body;

    // Verify hotel belongs to the admin
    const hotel = await Hotel.findOne({ hotelAdmin: req.user._id });
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel profile not found for this admin' });
    }

    let roomImageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => uploadImage(file.buffer, 'rooms'));
      roomImageUrls = await Promise.all(uploadPromises);
    }

    const room = await Room.create({
      hotelId: hotel._id,
      roomType,
      description,
      price,
      capacity,
      availableRooms,
      images: roomImageUrls,
    });

    res.status(201).json({ success: true, room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a room category details (Hotel Admin)
// @route   PUT /api/rooms/:id
// @access  Private/HotelAdmin
const updateRoom = async (req, res) => {
  try {
    const { roomType, description, price, capacity, availableRooms } = req.body;
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room category not found' });
    }

    // Verify hotel admin ownership
    const hotel = await Hotel.findOne({ _id: room.hotelId, hotelAdmin: req.user._id });
    if (!hotel) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit rooms in this hotel' });
    }

    room.roomType = roomType || room.roomType;
    room.description = description || room.description;
    room.price = price ? parseFloat(price) : room.price;
    room.capacity = capacity ? parseInt(capacity) : room.capacity;
    room.availableRooms = availableRooms ? parseInt(availableRooms) : room.availableRooms;

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => uploadImage(file.buffer, 'rooms'));
      const uploadedUrls = await Promise.all(uploadPromises);
      room.images = [...room.images, ...uploadedUrls];
    }

    await room.save();
    res.json({ success: true, room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a room category (Hotel Admin)
// @route   DELETE /api/rooms/:id
// @access  Private/HotelAdmin
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room category not found' });
    }

    // Verify ownership
    const hotel = await Hotel.findOne({ _id: room.hotelId, hotelAdmin: req.user._id });
    if (!hotel) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete rooms in this hotel' });
    }

    await Room.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Room category removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all rooms of a hotel
// @route   GET /api/rooms/hotel/:hotelId
// @access  Public
const getRoomsByHotel = async (req, res) => {
  try {
    const rooms = await Room.find({ hotelId: req.params.hotelId });
    res.json({ success: true, count: rooms.length, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addRoom,
  updateRoom,
  deleteRoom,
  getRoomsByHotel,
};
