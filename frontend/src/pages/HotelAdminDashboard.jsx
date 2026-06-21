import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { api } from '../context/AuthContext';
import {
  Building,
  Bed,
  CalendarCheck,
  TrendingUp,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Luggage,
  FolderOpen
} from 'lucide-react';

const HotelAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Forms states
  // Hotel Profile Form
  const [hotelName, setHotelName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [amenities, setAmenities] = useState('');
  const [hotelFiles, setHotelFiles] = useState([]);

  // Room Form
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editRoomId, setEditRoomId] = useState(null);
  const [roomType, setRoomType] = useState('Single Room');
  const [roomDescription, setRoomDescription] = useState('');
  const [roomPrice, setRoomPrice] = useState('');
  const [roomCapacity, setRoomCapacity] = useState('1');
  const [roomAvailable, setRoomAvailable] = useState('1');
  const [roomFiles, setRoomFiles] = useState([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Admin's Hotel Profile
      const hotelRes = await api.get('/hotels/myhotel');
      if (hotelRes.data.success) {
        const hotelData = hotelRes.data.hotel;
        setHotel(hotelData);
        setHotelName(hotelData.hotelName);
        setDescription(hotelData.description);
        setAddress(hotelData.address);
        setCity(hotelData.city);
        setState(hotelData.state);
        setAmenities(hotelData.amenities.join(', '));

        // 2. Fetch Rooms for this Hotel
        const roomsRes = await api.get(`/rooms/hotel/${hotelData._id}`);
        if (roomsRes.data.success) {
          setRooms(roomsRes.data.rooms);
        }
      }
    } catch (error) {
      console.error('Hotel profile not created yet or load error:', error);
      setHotel(null);
    }

    try {
      // 3. Fetch Bookings for this Hotel
      const bookingsRes = await api.get('/bookings/hotel');
      if (bookingsRes.data.success) {
        setBookings(bookingsRes.data.bookings);
      }

      // 4. Fetch Analytics
      const analyticsRes = await api.get('/analytics/hotel');
      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.analytics);
      }
    } catch (error) {
      console.error('Analytics or booking fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Update Hotel Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData();
    formData.append('hotelName', hotelName);
    formData.append('description', description);
    formData.append('address', address);
    formData.append('city', city);
    formData.append('state', state);
    formData.append('amenities', amenities);

    if (hotelFiles.length > 0) {
      for (let i = 0; i < hotelFiles.length; i++) {
        formData.append('images', hotelFiles[i]);
      }
    }

    try {
      // If hotel profile doesn't exist, POST to register, else PUT to update
      let res;
      if (!hotel) {
        res = await api.post('/hotels', { hotelName, description, address, city, state, amenities });
      } else {
        res = await api.put('/hotels/profile', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (res.data.success) {
        setMessage({ type: 'success', text: 'Hotel profile saved successfully!' });
        setHotelFiles([]);
        fetchDashboardData();
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save hotel profile.' });
    }
  };

  // Create or Update Room category
  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const formData = new FormData();
    formData.append('roomType', roomType);
    formData.append('description', roomDescription);
    formData.append('price', roomPrice);
    formData.append('capacity', roomCapacity);
    formData.append('availableRooms', roomAvailable);

    if (roomFiles.length > 0) {
      for (let i = 0; i < roomFiles.length; i++) {
        formData.append('images', roomFiles[i]);
      }
    }

    try {
      let res;
      if (editRoomId) {
        res = await api.put(`/rooms/${editRoomId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await api.post('/rooms', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (res.data.success) {
        setMessage({ type: 'success', text: `Room category ${editRoomId ? 'updated' : 'added'} successfully!` });
        setShowRoomModal(false);
        setEditRoomId(null);
        setRoomDescription('');
        setRoomPrice('');
        setRoomFiles([]);
        fetchDashboardData();
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save room.' });
    }
  };

  const handleEditRoom = (room) => {
    setEditRoomId(room._id);
    setRoomType(room.roomType);
    setRoomDescription(room.description);
    setRoomPrice(room.price);
    setRoomCapacity(room.capacity);
    setRoomAvailable(room.availableRooms);
    setShowRoomModal(true);
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Delete this room category permanently?')) return;
    setMessage(null);

    try {
      const { data } = await api.delete(`/rooms/${roomId}`);
      if (data.success) {
        setMessage({ type: 'success', text: 'Room category deleted successfully.' });
        fetchDashboardData();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete room.' });
    }
  };

  // Manage Bookings
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    setMessage(null);
    try {
      const { data } = await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      if (data.success) {
        setMessage({ type: 'success', text: `Booking status updated to ${newStatus}. Guest notified.` });
        fetchDashboardData();
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Booking update failed.' });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-blue-150 text-blue-800';
      case 'Checked In':
        return 'bg-amber-150 text-amber-800';
      case 'Checked Out':
        return 'bg-emerald-155 text-emerald-800';
      case 'Cancelled':
        return 'bg-red-150 text-red-800';
      case 'Pending':
      default:
        return 'bg-slate-150 text-slate-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Hotel Management Portal</h1>
            <p className="text-slate-500 text-sm">
              {hotel ? `Managing ${hotel.hotelName}` : 'Register your hotel properties to start hosting guests.'}
            </p>
          </div>
          {hotel && activeTab === 'rooms' && (
            <button
              onClick={() => {
                setEditRoomId(null);
                setRoomDescription('');
                setRoomPrice('');
                setRoomFiles([]);
                setShowRoomModal(true);
              }}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded-lg text-sm flex items-center space-x-1.5 shadow-sm"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Add Category</span>
            </button>
          )}
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-850' : 'bg-red-50 text-red-850'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Navigation tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              activeTab === 'analytics'
                ? 'border-primary-650 text-primary-650'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              activeTab === 'profile'
                ? 'border-primary-650 text-primary-650'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Hotel Profile
          </button>
          {hotel && (
            <>
              <button
                onClick={() => setActiveTab('rooms')}
                className={`px-4 py-2 font-medium text-sm border-b-2 ${
                  activeTab === 'rooms'
                    ? 'border-primary-650 text-primary-650'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Room Inventory
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-4 py-2 font-medium text-sm border-b-2 ${
                  activeTab === 'bookings'
                    ? 'border-primary-650 text-primary-650'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Bookings Requests
              </button>
            </>
          )}
        </div>

        {/* Tab content bodies */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : activeTab === 'analytics' ? (
          <div className="space-y-6">
            {/* Stat counters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-primary-100 dark:bg-primary-950/50 rounded-xl text-primary-600">
                  <CalendarCheck className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500">TOTAL BOOKINGS</span>
                  <h3 className="text-2xl font-bold">{analytics?.totalBookings || 0}</h3>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-950/50 rounded-xl text-emerald-600">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500">REVENUE GENERATED</span>
                  <h3 className="text-2xl font-bold">Rs. {analytics?.totalRevenue || 0}</h3>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-950/50 rounded-xl text-amber-600">
                  <Bed className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500">TOTAL ROOMS CAPACITY</span>
                  <h3 className="text-2xl font-bold">{analytics?.totalRoomsCapacity || 0}</h3>
                </div>
              </div>
            </div>

            {/* Custom styled analytics graph representation */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-sm text-slate-550 mb-4">MONTHLY REVENUE BAR (PAST 6 MONTHS)</h3>
              {analytics?.monthlyRevenue?.length === 0 ? (
                <p className="text-sm text-slate-500 py-10 text-center">No monthly statistics collected yet.</p>
              ) : (
                <div className="flex items-end justify-between h-48 pt-6 border-b border-slate-200 dark:border-slate-700 max-w-lg mx-auto">
                  {analytics?.monthlyRevenue?.map((m) => {
                    const maxVal = Math.max(...analytics.monthlyRevenue.map((x) => x.revenue), 1);
                    const heightPercent = (m.revenue / maxVal) * 100;
                    return (
                      <div key={`${m._id.month}-${m._id.year}`} className="flex flex-col items-center w-1/6 group">
                        <span className="text-xs font-bold text-primary-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {m.revenue}
                        </span>
                        <div
                          style={{ height: `${Math.max(10, heightPercent)}%` }}
                          className="w-8 bg-primary-600 dark:bg-primary-500 rounded-t-md hover:bg-primary-750 cursor-pointer transition-all"
                        ></div>
                        <span className="text-[10px] font-semibold text-slate-500 mt-2">
                          M{m._id.month}/{m._id.year.toString().slice(-2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'profile' ? (
          <form onSubmit={handleUpdateProfile} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="font-bold text-lg mb-2">Hotel Properties</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">HOTEL NAME</label>
                <input
                  type="text"
                  required
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm focus:outline-none dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">CITY</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm focus:outline-none dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">ADDRESS</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm focus:outline-none dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">STATE</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm focus:outline-none dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">AMENITIES (COMMA SEPARATED)</label>
              <input
                type="text"
                placeholder="WiFi, Pool, AC, Parking"
                value={amenities}
                onChange={(e) => setAmenities(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm focus:outline-none dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">DESCRIPTION</label>
              <textarea
                rows="4"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm focus:outline-none dark:text-white"
              ></textarea>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">UPLOAD IMAGES</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setHotelFiles(e.target.files)}
                className="text-sm cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded-lg text-sm flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <Save className="h-4.5 w-4.5" />
              <span>Save Hotel Settings</span>
            </button>
          </form>
        ) : activeTab === 'rooms' ? (
          rooms.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
              <Bed className="h-10 w-10 mx-auto text-slate-400 mb-2" />
              <p className="font-semibold">No room categories listed</p>
              <p className="text-slate-500 text-sm mt-1">Add room categories (Single, Suite, Deluxe) to receive bookings.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rooms.map((room) => (
                <div
                  key={room._id}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
                >
                  <div className="h-44 bg-slate-100 dark:bg-slate-950">
                    <img
                      src={room.images[0] || 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=400&q=80'}
                      alt={room.roomType}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 flex-grow space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-md">{room.roomType}</h4>
                        <span className="font-bold text-sm text-primary-600">Rs. {room.price} / night</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mt-1">{room.description}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-xs text-slate-500">
                      <span>Max Guests: {room.capacity} &bull; Inventory: {room.availableRooms}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditRoom(room)}
                          className="text-primary-600 font-semibold hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(room._id)}
                          className="text-red-500 font-semibold hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : bookings.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
            <CalendarCheck className="h-10 w-10 mx-auto text-slate-400 mb-2" />
            <p className="font-semibold">No bookings placed yet</p>
            <p className="text-slate-500 text-sm mt-1">Bookings requested by customer profiles will show up here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div
                key={b._id}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100">{b.userId?.name}</h4>
                  <p className="text-xs text-slate-500">
                    Category: {b.roomId?.roomType} &bull; Check In: {new Date(b.checkInDate).toLocaleDateString()} &bull; Check Out: {new Date(b.checkOutDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs font-semibold text-primary-600">Total Charged: Rs. {b.totalAmount}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className={`text-xs px-2.5 py-0.5 rounded font-semibold ${getStatusBadge(b.bookingStatus)}`}>
                    {b.bookingStatus}
                  </span>

                  {/* Actions depending on booking status */}
                  {b.bookingStatus === 'Pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateBookingStatus(b._id, 'Confirmed')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 py-1 rounded font-medium flex items-center"
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                      </button>
                      <button
                        onClick={() => handleUpdateBookingStatus(b._id, 'Cancelled')}
                        className="bg-red-650 hover:bg-red-750 text-white text-xs px-2.5 py-1 rounded font-medium flex items-center"
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                      </button>
                    </div>
                  )}

                  {b.bookingStatus === 'Confirmed' && (
                    <button
                      onClick={() => handleUpdateBookingStatus(b._id, 'Checked In')}
                      className="bg-primary-600 hover:bg-primary-750 text-white text-xs px-2.5 py-1 rounded font-medium flex items-center"
                    >
                      <Luggage className="h-3.5 w-3.5 mr-1" /> Guest Check-In
                    </button>
                  )}

                  {b.bookingStatus === 'Checked In' && (
                    <button
                      onClick={() => handleUpdateBookingStatus(b._id, 'Checked Out')}
                      className="bg-emerald-600 hover:bg-emerald-750 text-white text-xs px-2.5 py-1 rounded font-medium flex items-center"
                    >
                      <Luggage className="h-3.5 w-3.5 mr-1" /> Guest Check-Out
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Room Modal Dialog */}
        {showRoomModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-md w-full space-y-4">
              <h3 className="font-bold text-lg">{editRoomId ? 'Edit' : 'Add'} Room Category</h3>
              <form onSubmit={handleRoomSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">ROOM TYPE</label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm focus:outline-none dark:text-white"
                  >
                    <option value="Single Room">Single Room</option>
                    <option value="Double Room">Double Room</option>
                    <option value="Deluxe Room">Deluxe Room</option>
                    <option value="Suite Room">Suite Room</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1 space-y-1">
                    <label className="text-xs font-semibold text-slate-500">PRICE</label>
                    <input
                      type="number"
                      required
                      placeholder="Rs."
                      value={roomPrice}
                      onChange={(e) => setRoomPrice(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-lg text-sm focus:outline-none dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">CAPACITY</label>
                    <input
                      type="number"
                      required
                      value={roomCapacity}
                      onChange={(e) => setRoomCapacity(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-lg text-sm focus:outline-none dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">INVENTORY</label>
                    <input
                      type="number"
                      required
                      value={roomAvailable}
                      onChange={(e) => setRoomAvailable(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-lg text-sm focus:outline-none dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">ROOM DESCRIPTION</label>
                  <textarea
                    rows="3"
                    required
                    value={roomDescription}
                    onChange={(e) => setRoomDescription(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm focus:outline-none dark:text-white"
                  ></textarea>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">ROOM IMAGES</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setRoomFiles(e.target.files)}
                    className="text-xs cursor-pointer"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRoomModal(false)}
                    className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary-600 hover:bg-primary-750 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm"
                  >
                    Save Room
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HotelAdminDashboard;
