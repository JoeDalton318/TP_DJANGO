/**
 * Service API pour la gestion des profils utilisateur (Personne 1)
 * Remplace localStorage par de vraies requêtes API
 */
import { getAuthHeaders } from '../utils/tokenUtils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// Helper pour gérer les erreurs de response
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

class ProfilesAPI {
  
  /**
   * Récupérer tous les profils
   */
  async getProfiles() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/attractions/profiles/`, {
        headers: getAuthHeaders(),
      });
      const data = await handleResponse(response);
      
      // Si c'est une réponse paginée, retourner seulement les results
      if (data && typeof data === 'object' && Array.isArray(data.results)) {
        return data.results;
      }
      
      // Sinon retourner la data directement
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des profils:', error);
      throw error;
    }
  }

  /**
   * Récupérer un profil par ID
   */
  async getProfile(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/attractions/profiles/${id}/`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      throw error;
    }
  }

  /**
   * Créer un nouveau profil
   */
  async createProfile(profileData) {
    console.log('📤 Envoi de données de profil:', profileData);
    console.log('🔑 Token disponible:', localStorage.getItem('access_token') ? 'Oui' : 'Non');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/attractions/profiles/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData)
      });
      
      console.log('📥 Réponse du serveur:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur serveur:', errorText);
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ Profil créé:', result);
      return result;
    } catch (error) {
      console.error('❌ Erreur lors de la création du profil:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un profil
   */
  async updateProfile(id, profileData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/attractions/profiles/${id}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData)
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  }

  /**
   * Supprimer un profil
   */
  async deleteProfile(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/attractions/profiles/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du profil:', error);
      throw error;
    }
  }

  /**
   * Récupérer les statistiques des profils
   */
  async getProfilesStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/attractions/profiles/stats/`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  /**
   * Récupérer les compilations d'un profil
   */
  async getProfileCompilations(profileId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/attractions/profiles/${profileId}/compilations/`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Erreur lors de la récupération des compilations du profil:', error);
      throw error;
    }
  }

  /**
   * Valider les données d'un profil
   */
  validateProfile(profileData) {
    const errors = {};
    
    if (!profileData.name || profileData.name.trim().length < 2) {
      errors.name = 'Le nom doit contenir au moins 2 caractères';
    }
    
    if (!profileData.age || profileData.age < 1 || profileData.age > 120) {
      errors.age = 'L\'âge doit être entre 1 et 120 ans';
    }
    
    if (!profileData.profile_type) {
      errors.profile_type = 'Le type de profil est requis';
    }
    
    if (!profileData.budget_range) {
      errors.budget_range = 'La tranche de budget est requise';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Mapper un profil pour l'affichage
   */
  mapProfileForDisplay(profile) {
    return {
      ...profile,
      displayName: profile.name,
      profileTypeLabel: this.getProfileTypeLabel(profile.profile_type),
      budgetRangeLabel: this.getBudgetRangeLabel(profile.budget_range)
    };
  }

  /**
   * Obtenir le label d'un type de profil
   */
  getProfileTypeLabel(type) {
    const labels = {
      'local': 'Explorateur Local',
      'tourist': 'Voyageur Touriste', 
      'professional': 'Professionnel en Déplacement'
    };
    return labels[type] || type;
  }

  /**
   * Obtenir le label d'une tranche de budget
   */
  getBudgetRangeLabel(range) {
    const labels = {
      'low': '0-100€',
      'medium': '100-500€',
      'high': '500-1000€',
      'luxury': '1000€+'
    };
    return labels[range] || range;
  }
}

// Exporter une instance unique
export const profilesAPI = new ProfilesAPI();
export default profilesAPI;