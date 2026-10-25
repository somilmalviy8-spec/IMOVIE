import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('the_imovies_token'));
  const [loading, setLoading] = useState(true);

  // Auth Modal State (global so any component can trigger login/register)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'

  // Fetch current user if token exists on app load
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.warn('Session expired or invalid, clearing credentials:', err.message);
        localStorage.removeItem('the_imovies_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();

    // Listen for 401 token invalidation from API interceptor
    const handleUnauthorized = () => {
      localStorage.removeItem('the_imovies_token');
      setToken(null);
      setUser(null);
    };

    window.addEventListener('the_imovies_auth_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('the_imovies_auth_unauthorized', handleUnauthorized);
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('the_imovies_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setIsAuthModalOpen(false);
      return res.data.user;
    }
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data.success) {
      localStorage.setItem('the_imovies_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setIsAuthModalOpen(false);
      return res.data.user;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Best-effort logout notification
    } finally {
      localStorage.removeItem('the_imovies_token');
      setToken(null);
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    if (res.data.success) {
      setUser(res.data.user);
      return res.data.user;
    }
  };

  const openAuthModal = useCallback((mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        setAuthModalMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
