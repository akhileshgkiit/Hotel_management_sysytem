import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/PrivateRoute';

// Public Pages
import Home from './pages/Home';
import HotelsListing from './pages/HotelsListing';
import HotelDetails from './pages/HotelDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import VerifyEmail from './pages/VerifyEmail';

// Private Dashboards & Profiles
import Profile from './pages/Profile';
import UserDashboard from './pages/UserDashboard';
import HotelAdminDashboard from './pages/HotelAdminDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Checkout from './pages/Checkout';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/hotels" element={<HotelsListing />} />
            <Route path="/hotels/:id" element={<HotelDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Customer Private Routes */}
            <Route element={<PrivateRoute allowedRoles={['user', 'admin']} />}>
              <Route path="/user-dashboard" element={<UserDashboard />} />
              <Route path="/user-dashboard/bookings" element={<UserDashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/checkout/:bookingId" element={<Checkout />} />
              <Route path="/checkout/success-esewa" element={<Checkout />} />
              <Route path="/checkout/success-khalti" element={<Checkout />} />
            </Route>

            {/* Hotel Admin Private Routes */}
            <Route element={<PrivateRoute allowedRoles={['hotelAdmin']} />}>
              <Route path="/hotel-admin-dashboard" element={<HotelAdminDashboard />} />
              <Route path="/hotel-admin-dashboard/profile" element={<HotelAdminDashboard />} />
              <Route path="/hotel-admin-dashboard/rooms" element={<HotelAdminDashboard />} />
              <Route path="/hotel-admin-dashboard/bookings" element={<HotelAdminDashboard />} />
            </Route>

            {/* Super Admin Private Routes */}
            <Route element={<PrivateRoute allowedRoles={['admin']} />}>
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/admin-dashboard/users" element={<AdminDashboard />} />
              <Route path="/admin-dashboard/hotels" element={<AdminDashboard />} />
              <Route path="/admin-dashboard/bookings" element={<AdminDashboard />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
