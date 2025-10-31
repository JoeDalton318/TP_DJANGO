import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 35000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer le refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/users/token/refresh/`, {
          refresh: refreshToken,
        });

        localStorage.setItem('accessToken', response.data.access);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Services pour l'authentification
export const authAPI = {
  register: async (data) => {
    const response = await api.post('/users/register/', data);
    return response.data;
  },

  login: async (data) => {
    const response = await api.post('/users/login/', data);
    localStorage.setItem('accessToken', response.data.access);
    localStorage.setItem('refreshToken', response.data.refresh);
    return response.data;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    await api.post('/users/logout/', { refresh: refreshToken });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  getProfile: async () => {
    const response = await api.get('/users/profile/me/');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.post('/users/profile/select_profile/', data);
    return response.data;
  },

  updateUserInfo: async (data) => {
    const response = await api.put('/users/profile/update_info/', data);
    return response.data;
  },

  changePassword: async (data) => {
    const response = await api.post('/users/profile/change_password/', data);
    return response.data;
  },
};

// Services pour les attractions
export const attractionsAPI = {
  searchAttractions: async (params = {}) => {
    const response = await api.get('/attractions/search/', { params });
    return response.data;
  },

  getPopularAttractions: async (params = {}) => {
    const response = await api.get('/attractions/popular/', { params });
    return response.data;
  },

  getNearbyAttractions: async (params = {}) => {
    const response = await api.get('/attractions/nearby/', { params });
    return response.data;
  },

  getAttractionById: async (id) => {
    const response = await api.get(`/attractions/${id}/`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/attractions/categories/');
    return response.data;
  },

  getCountries: async () => {
    const response = await api.get('/attractions/countries/');
    return response.data;
  },

  getCuisines: async () => {
    // Retourner des données factices pour éviter l'erreur
    return { cuisines: [] };
  },

  getHotelStyles: async () => {
    // Retourner des données factices pour éviter l'erreur
    return { hotel_styles: [] };
  },

  getAttractionTypes: async () => {
    // Retourner des données factices pour éviter l'erreur
    return { attraction_types: [] };
  },
};

// Services pour les compilations
export const compilationAPI = {
  getCompilation: async (params = {}) => {
    const response = await api.get('/compilation/', { params });
    return response.data;
  },

  addAttraction: async (attractionId) => {
    const response = await api.post('/compilation/add/', { attraction_id: attractionId });
    return response.data;
  },

  removeAttraction: async (attractionId) => {
    const response = await api.delete(`/compilation/${attractionId}/remove/`);
    return response.data;
  },
  
  isInCompilation: async (attractionId) => {
    try {
      const response = await api.get('/compilation/');
      const attractions = response.data.attractions || [];
      return attractions.some(a => a.id === attractionId);
    } catch (error) {
      return false;
    }
  },
};

export default api;