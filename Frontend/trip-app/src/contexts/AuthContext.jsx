// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { login, refreshToken } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);

  const handleLogin = async (username, password) => {
    const data = await login(username, password);
    setToken(data.access);
    localStorage.setItem('accessToken', data.access);
    localStorage.setItem('refreshToken', data.refresh);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  useEffect(() => {
    const saved = localStorage.getItem('accessToken');
    if (saved) {
      setToken(saved);
      // optional: implement refresh logic here
    }
  }, []);

  return (
    <AuthContext.Provider value={{ token, setToken, handleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};
