// Service API pour l'authentification utilisateur

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// Helper pour inclure le token dans les headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper pour gérer les erreurs de response
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || 'Une erreur est survenue');
  }
  return response.json();
};

// API d'authentification
export const authAPI = {
  // Inscription d'un nouvel utilisateur
  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await handleResponse(response);
      
      // Stocker les tokens
      if (data.tokens) {
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
      }
      
      return data;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  },

  // Connexion utilisateur
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await handleResponse(response);
      
      // Stocker les tokens
      if (data.tokens) {
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
      }
      
      return data;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  },

  // Déconnexion utilisateur
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        await fetch(`${API_BASE_URL}/api/auth/logout/`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ refresh: refreshToken }),
        });
      }
      
      // Nettoyer le storage local
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Nettoyer le storage même en cas d'erreur
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      throw error;
    }
  },

  // Rafraîchir le token d'accès
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        throw new Error('Aucun token de rafraîchissement disponible');
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      const data = await handleResponse(response);
      
      // Mettre à jour le token d'accès
      if (data.access) {
        localStorage.setItem('access_token', data.access);
      }
      
      return data;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      // Si le rafraîchissement échoue, déconnecter l'utilisateur
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      throw error;
    }
  },

  // Obtenir les informations de l'utilisateur connecté
  getCurrentUser: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me/`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Erreur lors de la récupération des informations utilisateur:', error);
      throw error;
    }
  },

  // Mettre à jour le profil utilisateur
  updateProfile: async (profileData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    const token = localStorage.getItem('access_token');
    return !!token;
  },

  // Obtenir le token d'accès
  getAccessToken: () => {
    return localStorage.getItem('access_token');
  },

  // Interceptor pour les requêtes automatiques de rafraîchissement
  setupInterceptor: () => {
    // Cette fonction peut être appelée pour configurer un interceptor global
    // qui rafraîchit automatiquement les tokens expirés
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      let response = await originalFetch.apply(this, args);
      
      // Si la réponse indique un token expiré (401), essayer de le rafraîchir
      if (response.status === 401 && authAPI.isAuthenticated()) {
        try {
          await authAPI.refreshToken();
          // Retry la requête originale avec le nouveau token
          const newHeaders = {
            ...args[1]?.headers,
            Authorization: `Bearer ${authAPI.getAccessToken()}`,
          };
          args[1] = { ...args[1], headers: newHeaders };
          response = await originalFetch.apply(this, args);
        } catch (error) {
          // Si le rafraîchissement échoue, rediriger vers la page de connexion
          console.error('Token refresh failed:', error);
          window.location.href = '/login';
        }
      }
      
      return response;
    };
  },
};

export default authAPI;