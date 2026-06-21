import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { api, useAuth } from '../context/AuthContext';
import { Star, MapPin, Calendar, Bed, Users, ShieldAlert, CheckCircle2, MessageSquare, Send, Wallet, XSquare } from 'lucide-react';

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking details
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const handleBookClick = (room) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!checkIn || !checkOut) {
      setBookingMessage({ type: 'error', text: 'Please select both check-in and check-out dates.' });
      return;
    }
    const nights = calculateNights();
    if (nights <= 0) {
      setBookingMessage({ type: 'error', text: 'Check-out date must be after check-in date.' });
      return;
    }
    setSelectedRoom(room);
    setShowPaymentModal(true);
  };

  // Review posting states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const fetchHotelData = async () => {
    setLoading(true);
    try {
      const hotelRes = await api.get(`/hotels/${id}`);
      if (hotelRes.data.success) {
        setHotel(hotelRes.data.hotel);
        setRooms(hotelRes.data.rooms);
      }

      // Fetch reviews
      const reviewsRes = await api.get(`/reviews/hotel/${id}`);
      if (reviewsRes.data.success) {
        setReviews(reviewsRes.data.reviews);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error fetching hotel details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotelData();
  }, [id]);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const diffTime = outDate - inDate;
    if (diffTime <= 0) return 0;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleBooking = async (roomId, pricePerNight, skipPayment = true) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!checkIn || !checkOut) {
      setBookingMessage({ type: 'error', text: 'Please select both check-in and check-out dates.' });
      return;
    }

    const nights = calculateNights();
    if (nights <= 0) {
      setBookingMessage({ type: 'error', text: 'Check-out date must be after check-in date.' });
      return;
    }

    setBookingLoading(true);
    setBookingMessage(null);

    try {
      const { data } = await api.post('/bookings', {
        roomId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        skipPayment, // Bypass active payment gateway integration
      });

      if (data.success) {
        if (!skipPayment) {
          navigate(`/checkout/${data.booking._id}`);
          return;
        }

        setBookingMessage({
          type: 'success',
          text: `Booking request placed successfully! Status: Pending Approval. Email receipt generated.`,
        });
        // Clear dates
        setCheckIn('');
        setCheckOut('');
        // Refresh hotel room counts
        fetchHotelData();
      }
    } catch (err) {
      console.error(err);
      setBookingMessage({
        type: 'error',
        text: err.response?.data?.message || 'Booking failed. Please try again.',
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setReviewError(null);
    setReviewSuccess(false);

    try {
      const { data } = await api.post('/reviews', {
        hotelId: id,
        rating: reviewRating,
        comment: reviewComment,
      });

      if (data.success) {
        setReviewSuccess(true);
        setReviewComment('');
        // Reload reviews and hotel ratings
        fetchHotelData();
      }
    } catch (err) {
      console.error(err);
      setReviewError(err.response?.data?.message || 'Failed to submit review. You must have checked out or booked this hotel before reviewing.');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !hotel) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Error loading hotel stay</h2>
          <p className="text-slate-500 mt-2">{error || 'Hotel not found'}</p>
        </div>
      </MainLayout>
    );
  }

  const nights = calculateNights();

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{hotel.hotelName}</h1>
            <div className="flex items-center text-slate-500 dark:text-slate-400 mt-1">
              <MapPin className="h-4 w-4 mr-1 text-slate-400" />
              <span>{hotel.address}, {hotel.city}, {hotel.state}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 px-4 py-1.5 rounded-xl font-bold">
            <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
            <span className="text-lg">{hotel.rating || 'No ratings'}</span>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 h-96 rounded-2xl overflow-hidden shadow-md">
            <img
              src={hotel.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'}
              alt={hotel.hotelName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden md:flex flex-col gap-4 h-96">
            <div className="h-1/2 rounded-2xl overflow-hidden shadow-md">
              <img
                src={hotel.images[1] || 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80'}
                alt="Room view"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="h-1/2 rounded-2xl overflow-hidden shadow-md">
              <img
                src={hotel.images[2] || 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80'}
                alt="Reception"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Hotel Details Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Amenities and Descriptions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-3">
              <h2 className="text-xl font-bold">About the property</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{hotel.description}</p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold">Key Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {hotel.amenities.map((a) => (
                  <span
                    key={a}
                    className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Date Picker Card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md h-fit space-y-4">
            <h3 className="text-lg font-bold">Choose Stay Dates</h3>

            {/* Date Inputs */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">CHECK IN</label>
                <input
                  type="date"
                  value={checkIn}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm focus:outline-none dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">CHECK OUT</label>
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm focus:outline-none dark:text-white"
                />
              </div>
            </div>

            {nights > 0 && (
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                <span className="font-semibold text-sm">Selected Stay Duration: {nights} Nights</span>
              </div>
            )}

            {bookingMessage && (
              <div
                className={`p-3 rounded-lg text-sm flex items-start space-x-2 ${
                  bookingMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300'
                    : 'bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300'
                }`}
              >
                {bookingMessage.type === 'success' ? (
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <ShieldAlert className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-600" />
                )}
                <span>{bookingMessage.text}</span>
              </div>
            )}
          </div>
        </div>

        {/* Room Categories */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Select Room Category</h2>
          {rooms.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 rounded-2xl text-center">
              <Bed className="h-10 w-10 mx-auto text-slate-400 mb-2" />
              <p className="font-semibold">No room listings available</p>
              <p className="text-slate-500 text-sm mt-1">This property has not listed any room categories yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rooms.map((room) => (
                <div
                  key={room._id}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="h-48 overflow-hidden bg-slate-100 dark:bg-slate-900">
                    <img
                      src={room.images[0] || 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80'}
                      alt={room.roomType}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold">{room.roomType}</h3>
                        <span className="text-xl font-extrabold text-primary-600 dark:text-primary-400">
                          Rs. {room.price}
                          <span className="text-xs font-normal text-slate-500"> / night</span>
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        {room.description}
                      </p>

                      <div className="flex items-center space-x-6 text-sm text-slate-500 pt-2">
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" /> Max Guests: {room.capacity}
                        </span>
                        <span className="flex items-center">
                          <Bed className="h-4 w-4 mr-1" /> Stock: {room.availableRooms} rooms
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                      <div>
                        {nights > 0 && (
                          <div className="text-xs text-slate-500">
                            Total amount for {nights} night(s):{' '}
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              Rs. {room.price * nights}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleBookClick(room)}
                        disabled={bookingLoading || room.availableRooms === 0}
                        className={`px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-colors ${
                          room.availableRooms === 0
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-700'
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                        }`}
                      >
                        {room.availableRooms === 0 ? 'Sold Out' : 'Book Room'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Reviews Section */}
        <section className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight flex items-center">
              <MessageSquare className="h-6 w-6 mr-2 text-primary-500" />
              Customer Reviews ({reviews.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Review form */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 h-fit space-y-4">
              <h3 className="text-lg font-bold">Write a Review</h3>
              {isAuthenticated ? (
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">RATING</label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(parseInt(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm focus:outline-none dark:text-white"
                    >
                      <option value="5">5 Stars (Excellent)</option>
                      <option value="4">4 Stars (Very Good)</option>
                      <option value="3">3 Stars (Good)</option>
                      <option value="2">2 Stars (Fair)</option>
                      <option value="1">1 Star (Poor)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">COMMENTS</label>
                    <textarea
                      placeholder="Share your stay experience..."
                      rows="4"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm focus:outline-none dark:text-white"
                    ></textarea>
                  </div>

                  {reviewError && (
                    <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 p-2 rounded">{reviewError}</p>
                  )}
                  {reviewSuccess && (
                    <p className="text-xs text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 p-2 rounded">
                      Review posted successfully!
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 rounded-lg text-sm flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
                  >
                    <Send className="h-4 w-4" />
                    <span>Submit Review</span>
                  </button>
                </form>
              ) : (
                <p className="text-sm text-slate-500">
                  Please <span className="text-primary-500 font-semibold cursor-pointer" onClick={() => navigate('/login')}>log in</span> to submit a property review.
                </p>
              )}
            </div>

            {/* Reviews list */}
            <div className="lg:col-span-2 space-y-4">
              {reviews.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl text-center">
                  <p className="text-slate-500">No reviews have been posted for this property yet.</p>
                </div>
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <img
                          src={rev.userId?.profileImage}
                          alt={rev.userId?.name}
                          className="h-10 w-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <h4 className="font-semibold text-slate-850">{rev.userId?.name}</h4>
                          <span className="text-xs text-slate-400">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 px-2 py-0.5 rounded text-sm font-bold">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 mr-0.5" />
                        <span>{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-650 dark:text-slate-300 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

      {showPaymentModal && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 max-w-md w-full overflow-hidden shadow-2xl p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Confirm Your Stay</h3>
                <p className="text-slate-500 text-sm mt-1">{hotel?.hotelName}</p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-250"
              >
                <XSquare className="h-6 w-6" />
              </button>
            </div>

            {/* Stay Details summary */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Room Category:</span>
                <span className="font-semibold text-slate-850 dark:text-slate-200">{selectedRoom.roomType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nights:</span>
                <span className="font-semibold text-slate-850 dark:text-slate-200">{nights} night(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dates:</span>
                <span className="font-semibold text-slate-850 dark:text-slate-200">
                  {new Date(checkIn).toLocaleDateString()} - {new Date(checkOut).toLocaleDateString()}
                </span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between font-bold text-base mt-2">
                <span className="text-slate-850 dark:text-slate-350">Total Amount:</span>
                <span className="text-primary-600">Rs. {selectedRoom.price * nights}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  handleBooking(selectedRoom._id, selectedRoom.price, false);
                }}
                disabled={bookingLoading}
                className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white p-3.5 rounded-xl font-bold shadow-md hover:bg-primary-750 transition-colors"
              >
                <Wallet className="h-5 w-5" />
                <span>Pay Online (eSewa / Khalti)</span>
              </button>

              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  handleBooking(selectedRoom._id, selectedRoom.price, true);
                }}
                disabled={bookingLoading}
                className="w-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-250 p-3.5 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors border border-slate-200 dark:border-slate-600"
              >
                Book & Pay Later (At Hotel)
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default HotelDetails;
