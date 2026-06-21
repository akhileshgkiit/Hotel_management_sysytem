import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { Search, MapPin, Calendar, Users, Star, Award, ShieldCheck, Heart } from 'lucide-react';

const Home = () => {
  const [city, setCity] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('1');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (city) queryParams.set('city', city);
    if (checkIn) queryParams.set('checkIn', checkIn);
    if (checkOut) queryParams.set('checkOut', checkOut);
    navigate(`/hotels?${queryParams.toString()}`);
  };

  // Popular locations for quick search
  const popularLocations = [
    { name: 'Mumbai', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=400&q=80' },
    { name: 'Delhi', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=400&q=80' },
    { name: 'Goa', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80' },
    { name: 'Bangalore', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=400&q=80' },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <div
        className="relative h-[550px] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.7)), url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Find Your Next Perfect Stay
          </h1>
          <p className="text-lg md:text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
            Book premium hotels, cozy resorts, and executive suites at unmatched prices. Simple booking, instant confirmation.
          </p>

          {/* Search Card */}
          <form
            onSubmit={handleSearch}
            className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl shadow-2xl grid grid-cols-1 md:grid-cols-4 gap-4 text-left border border-slate-200/50 dark:border-slate-700/50"
          >
            {/* Location */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center">
                <MapPin className="h-3 w-3 mr-1 text-primary-500" />
                DESTINATION
              </label>
              <input
                type="text"
                placeholder="Where are you going?"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
              />
            </div>

            {/* Check-In Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center">
                <Calendar className="h-3 w-3 mr-1 text-primary-500" />
                CHECK IN
              </label>
              <input
                type="date"
                value={checkIn}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
              />
            </div>

            {/* Check-Out Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center">
                <Calendar className="h-3 w-3 mr-1 text-primary-500" />
                CHECK OUT
              </label>
              <input
                type="date"
                value={checkOut}
                min={checkIn || new Date().toISOString().split('T')[0]}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
              />
            </div>

            {/* Guests & Search Button */}
            <div className="flex flex-col justify-end">
              <button
                type="submit"
                className="w-full h-[38px] bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg flex items-center justify-center space-x-2 shadow-md transition-colors"
              >
                <Search className="h-4 w-4" />
                <span>Search Hotels</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Benefits / Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Why Choose LuxeStay?</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            We provide a premium booking experience from start to finish.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-primary-100 dark:bg-primary-950/50 rounded-xl flex items-center justify-center">
              <Award className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-bold">Best Price Guaranteed</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Find a lower price elsewhere? We'll match it plus give you an additional discount.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-primary-100 dark:bg-primary-950/50 rounded-xl flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-bold">Verified Hotel Listings</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Every hotel registered on our platform is hand-checked and verified by our auditing team.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-primary-100 dark:bg-primary-950/50 rounded-xl flex items-center justify-center">
              <Heart className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-bold">Flexible Cancellations</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Plans change. That's why we offer free cancellation on most room categories up to check-in.
            </p>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="bg-slate-100 dark:bg-slate-900/50 py-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight mb-8">Popular Destinations</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {popularLocations.map((loc) => (
              <div
                key={loc.name}
                onClick={() => navigate(`/hotels?city=${loc.name}`)}
                className="relative h-64 rounded-2xl overflow-hidden cursor-pointer group shadow-md"
              >
                <img
                  src={loc.image}
                  alt={loc.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-4">
                  <h3 className="text-lg font-bold text-white">{loc.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Home;
