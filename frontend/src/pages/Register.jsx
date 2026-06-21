import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Phone, ShieldAlert, UserPlus, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const { register, loginWithGoogle, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('phone', phone);
    formData.append('role', role);

    const res = await register(formData);
    if (res.success) {
      navigate('/');
    }
  };

  const handleGoogleLogin = async () => {
    setValidationError('');
    const mockPayload = {
      email: 'googlecustomer@example.com',
      name: 'Google Guest Traveler',
      googleId: 'google_oauth_sub_987654321',
    };

    const res = await loginWithGoogle(null, mockPayload);
    if (res.success) {
      navigate('/');
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-10 transition-colors">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight">Create Account</h2>
            <p className="text-slate-500 text-sm">Join LuxeStay to start booking premium accommodations</p>
          </div>

          {(error || validationError) && (
            <div className="bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-300 p-3 rounded-lg text-sm flex items-start space-x-2">
              <ShieldAlert className="h-5 w-5 text-red-650 flex-shrink-0 mt-0.5" />
              <span>{validationError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">FULL NAME</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 pl-10 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 pl-10 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">PHONE NUMBER</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 pl-10 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                />
              </div>
            </div>

            {/* Password with Eye Toggle */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 pl-10 pr-10 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Register Role selection */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">I WANT TO REGISTER AS A</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
              >
                <option value="user">Customer / User</option>
                <option value="hotelAdmin">Hotel Administrator / Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-md flex items-center justify-center space-x-2 transition-colors disabled:bg-primary-400 pt-1"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  <span>Register Account</span>
                </>
              )}
            </button>
          </form>

          {/* Separator line */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs">or</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
          </div>

          {/* Google Sign-in Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-11 bg-white hover:bg-slate-50 text-slate-700 border border-slate-350 rounded-lg shadow-sm flex items-center justify-center font-semibold transition-colors dark:bg-slate-900 dark:text-white dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.62 0 3.08.56 4.22 1.65l3.15-3.15C17.45 1.76 14.92 1 12 1 7.35 1 3.39 3.67 1.41 7.56l3.77 2.92c.9-2.69 3.42-4.44 6.82-4.44z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.47-1.11 2.72-2.36 3.56l3.66 2.84c2.14-1.98 3.39-4.88 3.39-8.55z"
              />
              <path
                fill="#FBBC05"
                d="M5.18 10.48c-.23-.69-.36-1.43-.36-2.2 0-.77.13-1.51.36-2.2L1.41 3.16C.51 4.96 0 6.98 0 9.12c0 2.14.51 4.16 1.41 5.96l3.77-2.92.001-1.68z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.66-2.84c-1.01.67-2.3 1.07-3.96 1.07-3.4 0-5.92-2.15-6.82-4.44L1.41 16.8c1.98 3.89 5.94 6.56 10.59 6.56z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Register;
