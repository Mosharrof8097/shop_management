import { useState, useEffect } from 'react';
import { authService } from '../services/auth';

export const useAuth = () => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('hw_user');
    const token  = localStorage.getItem('hw_token');
    if (stored && token) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = async (userData, token) => {
    localStorage.setItem('hw_token', token);
    localStorage.setItem('hw_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('hw_token');
    localStorage.removeItem('hw_user');
    setUser(null);
  };

  // Call this after any update that changes user/shop data in localStorage
  const refreshUser = () => {
    const stored = localStorage.getItem('hw_user');
    if (stored) setUser(JSON.parse(stored));
  };

  return { user, loading, login, logout, refreshUser };
};
