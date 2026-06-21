import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Create default Axios instance for API interactions
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Axios interceptor to append JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current user details on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        if (data.success) {
          setUser(data);
        } else {
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to load user session', err.response?.data?.message || err.message);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.success) {
        localStorage.setItem('token', data.token);
        setUser(data);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Google Login handler
  const loginWithGoogle = async (idToken, mockPayload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/google', { idToken, mockPayload });
      if (data.success) {
        localStorage.setItem('token', data.token);
        setUser(data);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Google login failed';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (data.success) {
        localStorage.setItem('token', data.token);
        setUser(data);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Update profile handler
  const updateProfile = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.put('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (data.success) {
        setUser((prev) => ({
          ...prev,
          name: data.name,
          phone: data.phone,
          profileImage: data.profileImage,
        }));
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Profile update failed';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (hotelId) => {
    try {
      const { data } = await api.post('/users/wishlist', { hotelId });
      if (data.success) {
        setUser((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            wishlist: data.wishlist,
          };
        });
        return true;
      }
    } catch (err) {
      console.error('Wishlist toggle error:', err.response?.data?.message || err.message);
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        loginWithGoogle,
        register,
        logout,
        updateProfile,
        toggleWishlist,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isHotelAdmin: user?.role === 'hotelAdmin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
