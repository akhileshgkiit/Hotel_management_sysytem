import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { Award, Users, Heart, Star } from 'lucide-react';

const AboutUs = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Story Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight">Our Story</h1>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Launched in 2026, LuxeStay was founded with a simple vision: to bridge the gap between luxury hospitality and seamless digital booking. We believe that booking an executive hotel suite, a cozy beachside cottage, or a business room should be as relaxing as the stay itself.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Today, we serve thousands of customers globally, partnering with verified hoteliers to guarantee premium standards, verified reviews, and transparent pricing policies.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg h-80">
            <img
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80"
              alt="Luxury hotel lobby"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="bg-primary-600 rounded-2xl p-8 text-white grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <h3 className="text-3xl font-extrabold">500+</h3>
            <p className="text-xs text-primary-100">VERIFIED HOTELS</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-extrabold">20k+</h3>
            <p className="text-xs text-primary-100">HAPPY CUSTOMERS</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-extrabold">4.8</h3>
            <p className="text-xs text-primary-100">AVERAGE STAY RATING</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-extrabold">100%</h3>
            <p className="text-xs text-primary-100">SECURE TRANSACTIONS</p>
          </div>
        </div>

        {/* Values Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-center">Core Pillars of Excellence</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
              <Award className="h-8 w-8 text-primary-500" />
              <h3 className="text-lg font-bold">Absolute Premium Standards</h3>
              <p className="text-sm text-slate-500">
                We verify every property, inspecting rooms, pool status, hygiene logs, and staff ratings before registration approval.
              </p>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
              <Users className="h-8 w-8 text-primary-500" />
              <h3 className="text-lg font-bold">Dedicated Customer Care</h3>
              <p className="text-sm text-slate-500">
                Our support team is available 24/7. Whether you need a late checkout or a booking change, we've got you covered.
              </p>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
              <Heart className="h-8 w-8 text-primary-500" />
              <h3 className="text-lg font-bold">Transparent Policies</h3>
              <p className="text-sm text-slate-500">
                No hidden resort fees, no sudden cleaning surcharges. Clear cancellation policies clearly marked on every listing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AboutUs;
