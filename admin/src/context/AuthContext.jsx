import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for token and user
    const token = localStorage.getItem('gramseva_admin_token');
    const storedUser = localStorage.getItem('gramseva_admin_user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (phone, password) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { phone, password, loginType: 'auth' });
      
      if (res.data.role !== 'admin') {
        throw new Error('Access denied. Admins only.');
      }
      
      setUser(res.data);
      localStorage.setItem('gramseva_admin_token', res.data.token);
      localStorage.setItem('gramseva_admin_user', JSON.stringify(res.data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gramseva_admin_token');
    localStorage.removeItem('gramseva_admin_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
