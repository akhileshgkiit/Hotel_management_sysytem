import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building,
  Bed,
  CalendarCheck,
  User,
  LogOut,
  ArrowLeftRight
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const getLinks = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin-dashboard', icon: LayoutDashboard },
          { name: 'Manage Users', path: '/admin-dashboard/users', icon: Users },
          { name: 'Manage Hotels', path: '/admin-dashboard/hotels', icon: Building },
          { name: 'All Bookings', path: '/admin-dashboard/bookings', icon: CalendarCheck },
        ];
      case 'hotelAdmin':
        return [
          { name: 'Dashboard', path: '/hotel-admin-dashboard', icon: LayoutDashboard },
          { name: 'Hotel Profile', path: '/hotel-admin-dashboard/profile', icon: Building },
          { name: 'Room Inventory', path: '/hotel-admin-dashboard/rooms', icon: Bed },
          { name: 'Manage Bookings', path: '/hotel-admin-dashboard/bookings', icon: CalendarCheck },
        ];
      case 'user':
      default:
        return [
          { name: 'Dashboard', path: '/user-dashboard', icon: LayoutDashboard },
          { name: 'Booking History', path: '/user-dashboard/bookings', icon: CalendarCheck },
          { name: 'Edit Profile', path: '/profile', icon: User },
        ];
    }
  };

  const links = getLinks();

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-[calc(100vh-4rem)] transition-colors duration-300 flex flex-col justify-between">
      <div className="py-6 px-4 space-y-6">
        {/* User Mini Profile */}
        <div className="flex items-center space-x-3 pb-6 border-b border-slate-200 dark:border-slate-800">
          <img
            src={user?.profileImage}
            alt={user?.name}
            className="h-10 w-10 rounded-full object-cover border border-slate-300 dark:border-slate-700"
          />
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.name}</h4>
            <p className="text-xs text-slate-500 capitalize">{user?.role} Portal</p>
          </div>
        </div>

        {/* Navigation Options */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                end
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/30 dark:text-primary-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout Option at the bottom */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={logout}
          className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
