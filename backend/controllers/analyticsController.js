const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const Room = require('../models/Room');

// @desc    Get dashboard analytics for Hotel Admin
// @route   GET /api/analytics/hotel
// @access  Private/HotelAdmin
const getHotelAnalytics = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ hotelAdmin: req.user._id });
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel profile not found' });
    }

    const hotelId = hotel._id;

    // 1. Total bookings count
    const totalBookings = await Booking.countDocuments({ hotelId });

    // 2. Revenue aggregation
    const revenueData = await Booking.aggregate([
      {
        $match: {
          hotelId,
          bookingStatus: { $ne: 'Cancelled' },
          paymentStatus: 'Paid',
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // 3. Room categories inventory count
    const rooms = await Room.find({ hotelId });
    const totalRoomsCapacity = rooms.reduce((acc, curr) => acc + curr.availableRooms, 0);

    // 4. Booking status breakdown
    const statusBreakdown = await Booking.aggregate([
      { $match: { hotelId } },
      { $group: { _id: '$bookingStatus', count: { $sum: 1 } } },
    ]);

    // 5. Monthly revenue chart data (past 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          hotelId,
          bookingStatus: { $ne: 'Cancelled' },
          paymentStatus: 'Paid',
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      success: true,
      hotelName: hotel.hotelName,
      analytics: {
        totalBookings,
        totalRevenue,
        totalRoomsCapacity,
        statusBreakdown,
        monthlyRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get system-wide analytics for Super Admin
// @route   GET /api/analytics/admin
// @access  Private/Admin
const getAdminAnalytics = async (req, res) => {
  try {
    // 1. Core counters
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalHotelAdmins = await User.countDocuments({ role: 'hotelAdmin' });
    const totalHotels = await Hotel.countDocuments({});
    const totalBookings = await Booking.countDocuments({});

    // 2. Global Revenue
    const globalRevenueData = await Booking.aggregate([
      {
        $match: {
          bookingStatus: { $ne: 'Cancelled' },
          paymentStatus: 'Paid',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' },
        },
      },
    ]);
    const totalRevenue = globalRevenueData.length > 0 ? globalRevenueData[0].total : 0;

    // 3. Hotel status count
    const hotelStatusStats = await Hotel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // 4. Recent activity log
    const recentBookings = await Booking.find({})
      .populate('userId', 'name email')
      .populate('hotelId', 'hotelName')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentHotels = await Hotel.find({})
      .populate('hotelAdmin', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // 5. Global Monthly sales
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const globalMonthlySales = await Booking.aggregate([
      {
        $match: {
          bookingStatus: { $ne: 'Cancelled' },
          paymentStatus: 'Paid',
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      success: true,
      analytics: {
        totalUsers,
        totalHotelAdmins,
        totalHotels,
        totalBookings,
        totalRevenue,
        hotelStatusStats,
        recentBookings,
        recentHotels,
        globalMonthlySales,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getHotelAnalytics,
  getAdminAnalytics,
};
