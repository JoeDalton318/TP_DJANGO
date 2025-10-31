import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/authAPI';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vérifier l'authentification au chargement de l'app
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔍 Initialisation de l\'authentification...');
      console.log('🔑 Token présent:', !!localStorage.getItem('access_token'));
      
      try {
        if (authAPI.isAuthenticated()) {
          console.log('📥 Tentative de récupération des données utilisateur...');
          const userData = await authAPI.getCurrentUser();
          console.log('✅ Données utilisateur récupérées:', userData);
          setUser(userData.user);
        } else {
          console.log('❌ Pas de token valide');
        }
      } catch (error) {
        console.error('💥 Erreur lors de l\'initialisation de l\'authentification:', error);
        // Token invalide, nettoyer le storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      } finally {
        setLoading(false);
        console.log('🏁 Initialisation terminée');
      }
    };

    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Inscription
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.register(userData);
      setUser(response.user);
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Connexion
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.login(credentials);
      setUser(response.user);
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const logout = async () => {
    try {
      setLoading(true);
      await authAPI.logout();
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Déconnecter localement même si la requête échoue
      setUser(null);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  // Mise à jour du profil
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.updateProfile(profileData);
      setUser(response);
      
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Rafraîchir les données utilisateur
  const refreshUser = async () => {
    try {
      if (authAPI.isAuthenticated()) {
        const userData = await authAPI.getCurrentUser();
        setUser(userData.user);
        return userData.user;
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des données utilisateur:', error);
      // Token invalide, déconnecter
      await logout();
    }
  };

  // Vérifier si l'utilisateur est connecté
  const isAuthenticated = () => {
    const hasUser = !!user;
    const hasToken = authAPI.isAuthenticated();
    console.log(`🔍 isAuthenticated check - User: ${hasUser}, Token: ${hasToken}, Result: ${hasUser && hasToken}`);
    return hasUser && hasToken;
  };

  // Obtenir le profil utilisateur (UserProfile du modèle Django)
  const getUserProfile = () => {
    return user?.profile;
  };

  // Vérifier si l'utilisateur a un profil
  const hasProfile = () => {
    return !!getUserProfile();
  };

  const value = {
    // État
    user,
    loading,
    error,
    
    // Actions
    register,
    login,
    logout,
    updateProfile,
    refreshUser,
    
    // Helpers
    isAuthenticated,
    getUserProfile,
    hasProfile,
    
    // Setters (pour usage interne)
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;