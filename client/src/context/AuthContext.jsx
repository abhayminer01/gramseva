import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginContext, setLoginContext] = useState(localStorage.getItem('gramseva_active_context') || 'citizen'); // tracks which context was recently used

  useEffect(() => {
    // Attempt to load from the historically active context first
    let activeToken = localStorage.getItem(`gramseva_${loginContext}_token`);
    let activeUser = localStorage.getItem(`gramseva_${loginContext}_user`);

    if (!activeToken) {
       // fallback check
       const otherContext = loginContext === 'citizen' ? 'auth' : 'citizen';
       activeToken = localStorage.getItem(`gramseva_${otherContext}_token`);
       activeUser = localStorage.getItem(`gramseva_${otherContext}_user`);
       if(activeToken) setLoginContext(otherContext);
    }

    if (activeToken && activeUser) {
      setUser(JSON.parse(activeUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${activeToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (phone, password, loginType) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { phone, password, loginType });
      
      const role = res.data.role;
      // Pre-flight check
      if (loginType === 'citizen' && role !== 'citizen') {
         return { success: false, message: 'Invalid Route. Use Authority Login.' };
      }
      if (loginType === 'auth' && role === 'citizen') {
         return { success: false, message: 'Invalid Route. Use Citizen Login.' };
      }

      setUser(res.data);
      localStorage.setItem(`gramseva_${loginType}_token`, res.data.token);
      localStorage.setItem(`gramseva_${loginType}_user`, JSON.stringify(res.data));
      localStorage.setItem('gramseva_active_context', loginType);
      setLoginContext(loginType);
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(`gramseva_${loginContext}_token`);
    localStorage.removeItem(`gramseva_${loginContext}_user`);
    localStorage.removeItem('gramseva_active_context');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, loginContext }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
