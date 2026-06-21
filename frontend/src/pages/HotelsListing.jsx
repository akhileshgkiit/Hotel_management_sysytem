import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { api, useAuth } from '../context/AuthContext';
import { Star, MapPin, Heart, Wifi, Car, Flame, ShieldAlert, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const HotelsListing = () => {
  const query = new URLSearchParams(useLocation().search);
  const initialCity = query.get('city') || '';

  const { user, toggleWishlist, isAuthenticated } = useAuth();

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [city, setCity] = useState(initialCity);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [rating, setRating] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const amenitiesOptions = ['WiFi', 'Pool', 'Parking', 'Gym', 'Spa', 'AC', 'Restaurant'];

  const fetchHotels = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (city) params.city = city;
      if (priceMin) params.priceMin = priceMin;
      if (priceMax) params.priceMax = priceMax;
      if (rating) params.rating = rating;
      if (selectedAmenities.length > 0) params.amenities = selectedAmenities.join(',');

      const { data } = await api.get('/hotels', { params });
      if (data.success) {
        setHotels(data.hotels);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error fetching hotels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [city, priceMin, priceMax, rating, selectedAmenities]);

  const handleAmenityChange = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleWishlistToggle = async (e, hotelId) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to manage your wishlist');
      return;
    }
    await toggleWishlist(hotelId);
  };

  const isWishlisted = (hotelId) => {
    return user?.wishlist?.includes(hotelId);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filter Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 h-fit space-y-6">
            <h3 className="text-lg font-bold">Filters</h3>

            {/* City */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500">CITY</label>
              <input
                type="text"
                placeholder="Search city..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
              />
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500">PRICE (PER NIGHT)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="w-1/2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-1.5 rounded-lg text-sm focus:outline-none dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-1/2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-1.5 rounded-lg text-sm focus:outline-none dark:text-white"
                />
              </div>
            </div>

            {/* Star Rating */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500">MIN RATING</label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm focus:outline-none dark:text-white"
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4">4.0+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
                <option value="3">3.0+ Stars</option>
              </select>
            </div>

            {/* Amenities */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500">AMENITIES</label>
              <div className="space-y-1.5">
                {amenitiesOptions.map((amenity) => (
                  <label key={amenity} className="flex items-center text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(amenity)}
                      onChange={() => handleAmenityChange(amenity)}
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 mr-2 h-4 w-4"
                    />
                    <span>{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Results Grid */}
          <div className="flex-grow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight">Available Accommodations</h2>
              <span className="text-sm text-slate-500">{hotels.length} stays found</span>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
                <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="font-bold text-lg">Failed to load stays</p>
                <p className="text-slate-500 text-sm mt-1">{error}</p>
              </div>
            ) : hotels.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
                <Building className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="font-bold text-lg">No stays match your criteria</p>
                <p className="text-slate-500 text-sm mt-1">Try relaxing some of your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotels.map((hotel) => (
                  <Link
                    key={hotel._id}
                    to={`/hotels/${hotel._id}`}
                    className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between"
                  >
                    {/* Hotel Image & Wishlist Button */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={hotel.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
                        alt={hotel.hotelName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        onClick={(e) => handleWishlistToggle(e, hotel._id)}
                        className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-full text-slate-600 hover:text-red-500 transition-colors focus:outline-none"
                      >
                        <Heart
                          className={`h-4.5 w-4.5 ${
                            isWishlisted(hotel._id) ? 'fill-red-500 text-red-500' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {/* Hotel Metadata */}
                    <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate w-4/5">
                            {hotel.hotelName}
                          </h3>
                          <div className="flex items-center text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 px-2 py-0.5 rounded">
                            <Star className="h-3 w-3 mr-0.5 fill-amber-500 text-amber-500" />
                            <span>{hotel.rating || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                          <MapPin className="h-3.5 w-3.5 mr-1 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{hotel.city}, {hotel.state}</span>
                        </div>
                      </div>

                      {/* Amenities Icons Preview */}
                      <div className="flex gap-2">
                        {hotel.amenities.slice(0, 3).map((a) => (
                          <span
                            key={a}
                            className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300"
                          >
                            {a}
                          </span>
                        ))}
                        {hotel.amenities.length > 3 && (
                          <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300">
                            +{hotel.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HotelsListing;
