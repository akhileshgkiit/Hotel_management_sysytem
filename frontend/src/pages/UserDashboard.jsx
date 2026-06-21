import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { api, useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Bed, CalendarDays, Wallet, Heart, XSquare, MessageSquare, CheckCircle, ShieldAlert } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [wishlistHotels, setWishlistHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  const [message, setMessage] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch bookings
      const bookingsRes = await api.get('/bookings/mybookings');
      if (bookingsRes.data.success) {
        setBookings(bookingsRes.data.bookings);
      }

      // 2. Fetch wishlist hotels
      // Re-populate details if user session populated wishlist IDs
      if (user?.wishlist?.length > 0) {
        const wishlistPromises = user.wishlist.map(async (id) => {
          try {
            const res = await api.get(`/hotels/${id._id || id}`);
            return res.data.hotel;
          } catch (e) {
            return null;
          }
        });
        const hotels = await Promise.all(wishlistPromises);
        setWishlistHotels(hotels.filter((h) => h !== null));
      } else {
        setWishlistHotels([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.wishlist]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking stay?')) return;
    setMessage(null);

    try {
      const { data } = await api.put(`/bookings/${bookingId}/cancel`);
      if (data.success) {
        setMessage({ type: 'success', text: 'Booking cancelled successfully. Refund initiated.' });
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Cancellation failed.' });
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300';
      case 'Checked In':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300';
      case 'Checked Out':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300';
      case 'Pending':
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Dashboard</h1>
          <p className="text-slate-500 text-sm">Welcome back! Manage your bookings, wishlist, and profile.</p>
        </div>

        {/* Info stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-950/50 rounded-xl text-primary-600">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold">TOTAL BOOKINGS</span>
              <h3 className="text-2xl font-bold">{bookings.length}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/50 rounded-xl text-emerald-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold">COMPLETED STAYS</span>
              <h3 className="text-2xl font-bold">
                {bookings.filter((b) => b.bookingStatus === 'Checked Out').length}
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-red-100 dark:bg-red-950/50 rounded-xl text-red-600">
              <Heart className="h-6 w-6 fill-red-100 text-red-650" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold">WISHLIST ITEMS</span>
              <h3 className="text-2xl font-bold">{wishlistHotels.length}</h3>
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg text-sm flex items-start space-x-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20'
                : 'bg-red-50 text-red-800 dark:bg-red-950/20'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-emerald-650 mt-0.5" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-red-650 mt-0.5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'bookings'
                ? 'border-primary-650 text-primary-650'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            My Bookings
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'wishlist'
                ? 'border-primary-650 text-primary-650'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            My Wishlist
          </button>
        </div>

        {/* Tab Contents */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : activeTab === 'bookings' ? (
          bookings.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
              <CalendarDays className="h-10 w-10 mx-auto text-slate-400 mb-2" />
              <p className="font-semibold">No bookings found</p>
              <p className="text-slate-500 text-sm mt-1">Start exploring properties to schedule your next luxury getaway.</p>
              <Link
                to="/hotels"
                className="mt-4 inline-block bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700"
              >
                Search Stays
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-20 w-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                      <img
                        src={booking.hotelId?.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=200&q=80'}
                        alt={booking.hotelId?.hotelName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">
                        {booking.hotelId?.hotelName}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {booking.roomId?.roomType} &bull; Rs. {booking.roomId?.price} / night
                      </p>
                      <div className="text-xs text-slate-500 mt-2 flex items-center space-x-3">
                        <span>Check In: {new Date(booking.checkInDate).toLocaleDateString()}</span>
                        <span>&bull;</span>
                        <span>Check Out: {new Date(booking.checkOutDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end justify-between h-full space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2.5 py-0.5 rounded font-semibold ${getStatusStyle(booking.bookingStatus)}`}>
                        {booking.bookingStatus}
                      </span>
                      <span className={`text-xs px-2.5 py-0.5 rounded font-semibold ${
                        booking.paymentStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : booking.paymentStatus === 'Refunded'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300'
                      }`}>
                        {booking.paymentStatus}
                      </span>
                    </div>

                    <div className="text-sm font-bold text-primary-655">
                      Total: Rs. {booking.totalAmount}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2">
                      {booking.paymentStatus === 'Pending' && booking.bookingStatus !== 'Cancelled' && (
                        <Link
                          to={`/checkout/${booking._id}`}
                          className="flex items-center text-xs text-primary-600 dark:text-primary-400 font-bold hover:text-primary-800 bg-primary-50 dark:bg-primary-950/20 px-3 py-1.5 rounded-lg border border-primary-200 dark:border-primary-900 transition-colors"
                        >
                          <Wallet className="h-3.5 w-3.5 mr-1" />
                          Complete Payment
                        </Link>
                      )}

                      {['Pending', 'Confirmed'].includes(booking.bookingStatus) && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="flex items-center text-xs text-red-500 font-semibold hover:text-red-750 border border-transparent hover:border-red-200 dark:hover:border-red-900 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <XSquare className="h-4 w-4 mr-1" />
                          Cancel Booking
                        </button>
                      )}
                    </div>

                    {booking.bookingStatus === 'Checked Out' && (
                      <Link
                        to={`/hotels/${booking.hotelId?._id || booking.hotelId}`}
                        className="flex items-center text-xs text-primary-500 font-semibold hover:text-primary-750"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Write Review
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : wishlistHotels.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
            <Heart className="h-10 w-10 mx-auto text-slate-400 mb-2" />
            <p className="font-semibold">Your wishlist is empty</p>
            <p className="text-slate-500 text-sm mt-1">Bookmarked hotels will show up here for easy access.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistHotels.map((hotel) => (
              <Link
                key={hotel._id}
                to={`/hotels/${hotel._id}`}
                className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                <div className="h-40 overflow-hidden">
                  <img
                    src={hotel.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80'}
                    alt={hotel.hotelName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate">{hotel.hotelName}</h4>
                  <p className="text-xs text-slate-500">{hotel.city}, {hotel.state}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
