import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Menu, X, Hotel, User, LogOut, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    setDropdownOpen(false);
    navigate('/');
  };

  const getDashboardPath = () => {
    if (user?.role === 'admin') return '/admin-dashboard';
    if (user?.role === 'hotelAdmin') return '/hotel-admin-dashboard';
    return '/user-dashboard';
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 font-bold text-xl">
              <Hotel className="h-6 w-6" />
              <span className="tracking-wide">LuxeStay</span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 font-medium transition-colors">
              Home
            </Link>
            <Link to="/hotels" className="text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 font-medium transition-colors">
              Hotels
            </Link>
            <Link to="/about" className="text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 font-medium transition-colors">
              About Us
            </Link>
            <Link to="/contact" className="text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400 font-medium transition-colors">
              Contact
            </Link>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* User Controls */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <img
                    className="h-9 w-9 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                    src={user.profileImage}
                    alt={user.name}
                  />
                  <span className="text-slate-700 dark:text-slate-200 font-medium hidden lg:inline">{user.name}</span>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl py-1 border border-slate-200 dark:border-slate-700 animate-fade-in">
                    <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate capitalize">{user.role}</p>
                    </div>
                    <Link
                      to={getDashboardPath()}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 text-left"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-slate-700 hover:text-primary-600 dark:text-slate-200 dark:hover:text-primary-400 font-medium px-3 py-2"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden space-x-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2 space-y-1">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Home
          </Link>
          <Link
            to="/hotels"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Hotels
          </Link>
          <Link
            to="/about"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            About Us
          </Link>
          <Link
            to="/contact"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Contact
          </Link>

          {isAuthenticated ? (
            <div className="pt-4 pb-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center px-3 mb-3">
                <img
                  className="h-10 w-10 rounded-full object-cover mr-3"
                  src={user.profileImage}
                  alt={user.name}
                />
                <div>
                  <div className="text-base font-medium text-slate-800 dark:text-slate-200">{user.name}</div>
                  <div className="text-sm font-medium text-slate-500 dark:text-slate-400 capitalize">{user.role}</div>
                </div>
              </div>
              <Link
                to={getDashboardPath()}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-4 pb-2 border-t border-slate-200 dark:border-slate-800 flex flex-col space-y-2 px-3">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="text-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium py-2 rounded-md border border-slate-200 dark:border-slate-700"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="text-center bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 rounded-md shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
