import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { api } from '../context/AuthContext';
import {
  Users,
  Building,
  CalendarCheck,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Ban,
  UserCheck,
  BookOpen
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Users
      const usersRes = await api.get('/users');
      if (usersRes.data.success) {
        setUsers(usersRes.data.users);
      }

      // 2. Fetch Hotels
      const hotelsRes = await api.get('/hotels/admin/all');
      if (hotelsRes.data.success) {
        setHotels(hotelsRes.data.hotels);
      }

      // 3. Fetch Bookings
      const bookingsRes = await api.get('/bookings/admin/all');
      if (bookingsRes.data.success) {
        setBookings(bookingsRes.data.bookings);
      }

      // 4. Fetch Analytics
      const analyticsRes = await api.get('/analytics/admin');
      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.analytics);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleBlockUser = async (userId, currentBlocked) => {
    if (!window.confirm(`Are you sure you want to ${currentBlocked ? 'unblock' : 'block'} this user account?`)) return;
    setMessage(null);
    try {
      const { data } = await api.put(`/users/${userId}/block`);
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        fetchAdminData();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Action failed.' });
    }
  };

  const handleUpdateHotelStatus = async (hotelId, newStatus) => {
    if (!window.confirm(`Update hotel registration status to ${newStatus}?`)) return;
    setMessage(null);
    try {
      const { data } = await api.put(`/hotels/${hotelId}/status`, { status: newStatus });
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        fetchAdminData();
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Status update failed.' });
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300';
      case 'rejected':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300';
      case 'blocked':
        return 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300';
      case 'pending':
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Platform Administrator Panel</h1>
          <p className="text-slate-500 text-sm">Super Admin views to monitor statistics, approve hotel partners, and moderate users.</p>
        </div>

        {/* Global Counters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-950/50 rounded-xl text-primary-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold">TOTAL USERS</span>
              <h3 className="text-2xl font-bold">{analytics?.totalUsers || 0}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-950/50 rounded-xl text-indigo-600">
              <Building className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold">TOTAL HOTELS</span>
              <h3 className="text-2xl font-bold">{analytics?.totalHotels || 0}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-950/50 rounded-xl text-amber-600">
              <CalendarCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold">ALL BOOKINGS</span>
              <h3 className="text-2xl font-bold">{analytics?.totalBookings || 0}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/50 rounded-xl text-emerald-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold">TOTAL REVENUE</span>
              <h3 className="text-2xl font-bold">Rs. {analytics?.totalRevenue || 0}</h3>
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
              <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-red-650 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              activeTab === 'analytics'
                ? 'border-primary-650 text-primary-650'
                : 'border-transparent text-slate-500 hover:text-slate-850'
            }`}
          >
            Analytics & Logs
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              activeTab === 'users'
                ? 'border-primary-650 text-primary-650'
                : 'border-transparent text-slate-500 hover:text-slate-850'
            }`}
          >
            Manage Users
          </button>
          <button
            onClick={() => setActiveTab('hotels')}
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              activeTab === 'hotels'
                ? 'border-primary-650 text-primary-650'
                : 'border-transparent text-slate-500 hover:text-slate-850'
            }`}
          >
            Manage Hotels
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              activeTab === 'bookings'
                ? 'border-primary-650 text-primary-650'
                : 'border-transparent text-slate-500 hover:text-slate-850'
            }`}
          >
            Monitor Bookings
          </button>
        </div>

        {/* Tab panels */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : activeTab === 'analytics' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Global sales monthly visualizer */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-sm text-slate-550 mb-4">GLOBAL SYSTEM MONTHLY SALES</h3>
              {analytics?.globalMonthlySales?.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-10">No statistics collected yet.</p>
              ) : (
                <div className="flex items-end justify-between h-44 pt-6 border-b border-slate-200 dark:border-slate-700">
                  {analytics?.globalMonthlySales?.map((m) => {
                    const maxVal = Math.max(...analytics.globalMonthlySales.map((x) => x.revenue), 1);
                    const heightPercent = (m.revenue / maxVal) * 100;
                    return (
                      <div key={`${m._id.month}-${m._id.year}`} className="flex flex-col items-center w-1/6 group">
                        <span className="text-[10px] font-bold text-primary-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {m.revenue}
                        </span>
                        <div
                          style={{ height: `${Math.max(10, heightPercent)}%` }}
                          className="w-6 bg-primary-600 dark:bg-primary-500 rounded-t hover:bg-primary-750 transition-all cursor-pointer"
                        ></div>
                        <span className="text-[8px] font-semibold text-slate-500 mt-2">
                          M{m._id.month}/{m._id.year.toString().slice(-2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent registrations activity */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-550">RECENT PARTNER REGISTRATIONS</h3>
              {analytics?.recentHotels?.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No recent sign-ups.</p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-750">
                  {analytics?.recentHotels?.map((h) => (
                    <div key={h._id} className="py-2.5 flex justify-between items-center text-xs">
                      <div>
                        <h4 className="font-bold">{h.hotelName}</h4>
                        <p className="text-[10px] text-slate-500">{h.hotelAdmin?.email}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded font-semibold capitalize ${getStatusStyle(h.status)}`}>
                        {h.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'users' ? (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-3">NAME</th>
                  <th className="px-6 py-3">EMAIL</th>
                  <th className="px-6 py-3">PHONE</th>
                  <th className="px-6 py-3">ROLE</th>
                  <th className="px-6 py-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-bold flex items-center space-x-3">
                      <img src={u.profileImage} alt="" className="h-7 w-7 rounded-full object-cover" />
                      <span>{u.name}</span>
                    </td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">{u.phone}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold capitalize ${
                        u.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : u.role === 'hotelAdmin' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleBlockUser(u._id, u.isBlocked)}
                          className={`text-xs px-2.5 py-1 rounded font-semibold flex items-center ml-auto ${
                            u.isBlocked
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {u.isBlocked ? (
                            <>
                              <UserCheck className="h-3.5 w-3.5 mr-1" /> Unblock
                            </>
                          ) : (
                            <>
                              <Ban className="h-3.5 w-3.5 mr-1" /> Block
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'hotels' ? (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-3">HOTEL</th>
                  <th className="px-6 py-3">LOCATION</th>
                  <th className="px-6 py-3">ADMIN EMAIL</th>
                  <th className="px-6 py-3">STATUS</th>
                  <th className="px-6 py-3 text-right">APPROVALS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {hotels.map((h) => (
                  <tr key={h._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-bold">{h.hotelName}</td>
                    <td className="px-6 py-4">{h.city}, {h.state}</td>
                    <td className="px-6 py-4">{h.hotelAdmin?.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded font-semibold capitalize ${getStatusStyle(h.status)}`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end space-x-2">
                      {h.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateHotelStatus(h._id, 'approved')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2 py-1 rounded font-semibold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateHotelStatus(h._id, 'rejected')}
                            className="bg-red-650 hover:bg-red-750 text-white text-xs px-2 py-1 rounded font-semibold"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {h.status === 'approved' && (
                        <button
                          onClick={() => handleUpdateHotelStatus(h._id, 'blocked')}
                          className="bg-red-100 text-red-800 hover:bg-red-200 text-xs px-2 py-1 rounded font-semibold flex items-center"
                        >
                          <Ban className="h-3.5 w-3.5 mr-1" /> Block
                        </button>
                      )}
                      {h.status === 'blocked' && (
                        <button
                          onClick={() => handleUpdateHotelStatus(h._id, 'approved')}
                          className="bg-emerald-100 text-emerald-800 hover:bg-emerald-250 text-xs px-2 py-1 rounded font-semibold flex items-center"
                        >
                          <UserCheck className="h-3.5 w-3.5 mr-1" /> Unblock
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-3">USER</th>
                  <th className="px-6 py-3">HOTEL</th>
                  <th className="px-6 py-3">STAY DATES</th>
                  <th className="px-6 py-3 text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4">
                      <div className="font-bold">{b.userId?.name}</div>
                      <div className="text-[10px] text-slate-500">{b.userId?.email}</div>
                    </td>
                    <td className="px-6 py-4">{b.hotelId?.hotelName}</td>
                    <td className="px-6 py-4 text-xs">
                      {new Date(b.checkInDate).toLocaleDateString()} to {new Date(b.checkOutDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-800 dark:text-slate-200">
                      Rs. {b.totalAmount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
