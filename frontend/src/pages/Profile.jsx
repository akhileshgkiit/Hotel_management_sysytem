import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ShieldAlert, Save, Image as ImageIcon } from 'lucide-react';
import UserAvatar from '../components/UserAvatar';


const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profileImage || '');

  const [message, setMessage] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (password && password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setSubmitLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    if (password) {
      formData.append('password', password);
    }
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    const res = await updateProfile(formData);
    setSubmitLoading(false);

    if (res.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setPassword('');
      setConfirmPassword('');
    } else {
      setMessage({ type: 'error', text: res.message || 'Profile update failed.' });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Profile</h1>
          <p className="text-slate-500 text-sm">Update your contact information and security settings</p>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg text-sm flex items-start space-x-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300'
                : 'bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-300'
            }`}
          >
            {message.type === 'success' ? (
              <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-red-600 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center space-x-6">
            <div className="relative h-20 w-20 rounded-full overflow-hidden border border-slate-200 dark:border-slate-750 shadow-inner">
              <UserAvatar user={{ name, profileImage: imagePreview }} className="h-full w-full text-2xl" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">PROFILE PICTURE</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">FULL NAME</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">EMAIL ADDRESS (CANNOT BE CHANGED)</label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-lg text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">PHONE NUMBER</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
              />
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-700" />

          {/* Password Updates */}
          <div>
            <h3 className="font-bold text-sm text-slate-750 mb-3">Change Password (optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">NEW PASSWORD</label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">CONFIRM NEW PASSWORD</label>
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitLoading}
            className="w-full h-11 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-md flex items-center justify-center space-x-2 transition-colors disabled:bg-primary-400"
          >
            {submitLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
