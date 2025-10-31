import axios from 'axios';

// Configuration de base pour l'API Django
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 35000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Services pour les attractions
export const attractionsAPI = {
  // Recherche d'attractions avec filtres
  searchAttractions: async (params = {}) => {
    try {
      const response = await api.get('/attractions/search/', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche: ${error.message}`);
    }
  },

  // Attractions populaires
  getPopularAttractions: async (params = {}) => {
    try {
      const response = await api.get('/attractions/popular/', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des attractions populaires: ${error.message}`);
    }
  },

  // Détails d'une attraction
  getAttractionDetails: async (attractionId) => {
    try {
      const response = await api.get(`/attractions/${attractionId}/`);
      return response.data;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des détails: ${error.message}`);
    }
  },

  // Suggestions de recherche
  getSearchSuggestions: async (query) => {
    try {
      const response = await api.get('/attractions/suggestions/', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des suggestions: ${error.message}`);
    }
  },

  // Catégories disponibles
  getCategories: async () => {
    try {
      const response = await api.get('/attractions/categories/');
      return response.data;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des catégories: ${error.message}`);
    }
  },

  // Pays disponibles
  getCountries: async () => {
    try {
      const response = await api.get('/attractions/countries/');
      return response.data;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des pays: ${error.message}`);
    }
  },

  // Recherche par proximité GPS
  getNearbyAttractions: async (params = {}) => {
    try {
      const response = await api.get('/attractions/nearby/', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche par proximité: ${error.message}`);
    }
  },

  // Nouveaux endpoints pour filtres avancés
  getCuisines: async () => {
    try {
      const response = await api.get('/attractions/cuisines/');
      return response.data;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des cuisines: ${error.message}`);
    }
  },

  getHotelStyles: async () => {
    try {
      const response = await api.get('/attractions/hotel-styles/');
      return response.data;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des styles d'hôtels: ${error.message}`);
    }
  },

  getAttractionTypes: async () => {
    try {
      const response = await api.get('/attractions/attraction-types/');
      return response.data;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des types d'attractions: ${error.message}`);
    }
  },
};

// Services pour les compilations
export const compilationAPI = {
  // Récupérer la compilation de l'utilisateur
  getCompilation: async (params = {}) => {
    try {
      const response = await api.get('/compilation/', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de la compilation: ${error.message}`);
    }
  },

  // Ajouter une attraction à la compilation
  addAttraction: async (attractionId) => {
    try {
      const response = await api.post('/compilation/add/', {
        attraction_id: attractionId
      });
      return response.data;
    } catch (error) {
      throw new Error(`Erreur lors de l'ajout: ${error.message}`);
    }
  },

  // Supprimer une attraction de la compilation
  removeAttraction: async (attractionId) => {
    try {
      const response = await api.delete(`/compilation/${attractionId}/remove/`);
      return response.data;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }
  },
};

// Export par défaut de l'instance axios
export default api;

// Export nommé pour compatibilité
export { api };