import React from 'react';
import { Link } from 'react-router-dom';
import { Hotel, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2 text-white font-bold text-xl">
              <Hotel className="h-6 w-6 text-primary-400" />
              <span className="tracking-wide">LuxeStay</span>
            </Link>
            <p className="text-sm">
              Discover and book luxurious stays around the globe. Premium accommodations, secure booking processes, and outstanding hospitality.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/hotels" className="hover:text-white transition-colors">Search Hotels</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support & Policy</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">FAQs</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-3 text-sm">
            <h3 className="text-white font-semibold mb-4">Contact Info</h3>
            <div className="flex items-start space-x-2">
              <MapPin className="h-4 w-4 mt-0.5 text-primary-400 flex-shrink-0" />
              <span>123 Hospitality Lane, Suit 400, Mumbai, India</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-primary-400 flex-shrink-0" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-primary-400 flex-shrink-0" />
              <span>support@luxestay.com</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-xs">
          <p>&copy; {new Date().getFullYear()} LuxeStay. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
