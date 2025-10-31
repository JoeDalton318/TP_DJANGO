// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import {
  loginUser,
  refreshToken,
  logoutProfile,
  fetchProfile
} from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);

  // ✅ Correction ici : on utilise loginUser, pas login
  const handleLogin = async (username, password) => {
    try {
      const data = await loginUser({ username, password });
      setToken(data.access);
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      console.log('✅ Connexion réussie depuis AuthContext');
    } catch (error) {
      console.error('❌ Erreur de connexion dans AuthContext :', error);
    }
  };

  const handleLogout = async () => {
    try {
      const access = localStorage.getItem('accessToken');
      if (access) await logoutProfile(access); // on appelle ton endpoint /logout
    } catch (err) {
      console.warn('⚠️ Erreur pendant la déconnexion (non bloquante) :', err);
    } finally {
      setToken(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      console.log('👋 Déconnexion terminée');
    }
  };

  // ✅ Optionnel : restauration du token au démarrage
  useEffect(() => {
    const savedToken = localStorage.getItem('accessToken');
    if (savedToken) {
      setToken(savedToken);
      console.log('🔁 Token restauré depuis localStorage');
    }
  }, []);

  return (
    <AuthContext.Provider value={{ token, handleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};
