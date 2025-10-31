/**
 * Service API pour la gestion des compilations (Personne 3)
 * Remplace localStorage par de vraies requêtes API
 */
import { getAuthHeaders } from '../utils/tokenUtils';

const API_BASE_URL = 'http://127.0.0.1:8000/api/attractions';

class CompilationsAPI {
  
  /**
   * Récupérer toutes les compilations
   */
  async getCompilations(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Ajouter les filtres aux paramètres
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });
      
      const url = `${API_BASE_URL}/compilations/${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des compilations:', error);
      throw error;
    }
  }

  /**
   * Récupérer une compilation par ID avec ses items
   */
  async getCompilation(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/compilations/${id}/`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération de la compilation:', error);
      throw error;
    }
  }

  /**
   * Créer une nouvelle compilation
   */
  async createCompilation(compilationData) {
    try {
      const response = await fetch(`${API_BASE_URL}/compilations/`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(compilationData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la création de la compilation:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour une compilation
   */
  async updateCompilation(id, compilationData) {
    try {
      const response = await fetch(`${API_BASE_URL}/compilations/${id}/`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(compilationData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la compilation:', error);
      throw error;
    }
  }

  /**
   * Supprimer une compilation
   */
  async deleteCompilation(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/compilations/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (!response.ok && response.status !== 204) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la compilation:', error);
      throw error;
    }
  }

  /**
   * Ajouter une attraction à une compilation
   */
  async addAttractionToCompilation(compilationId, attractionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/compilations/${compilationId}/add_attraction/`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attractionData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'attraction:', error);
      throw error;
    }
  }

  /**
   * Retirer une attraction d'une compilation
   */
  async removeAttractionFromCompilation(compilationId, attractionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/compilations/${compilationId}/remove_attraction/`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attraction_id: attractionId })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'attraction:', error);
      throw error;
    }
  }

  /**
   * Récupérer les statistiques des compilations
   */
  async getCompilationsStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/compilations/stats/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  /**
   * Récupérer les compilations d'un profil utilisateur
   */
  async getCompilationsByProfile(profileId) {
    try {
      return await this.getCompilations({ user_profile: profileId });
    } catch (error) {
      console.error('Erreur lors de la récupération des compilations du profil:', error);
      throw error;
    }
  }

  /**
   * Marquer un item comme visité
   */
  async markItemAsVisited(itemId) {
    try {
      const response = await fetch(`${API_BASE_URL}/compilation-items/${itemId}/mark_visited/`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur lors du marquage comme visité:', error);
      throw error;
    }
  }

  /**
   * Calculer le budget total d'une compilation côté client
   */
  calculateBudget(compilation) {
    if (!compilation.items || compilation.items.length === 0) {
      return 0;
    }

    return compilation.items.reduce((total, item) => {
      return total + (item.effective_cost || 0);
    }, 0);
  }

  /**
   * Obtenir le statut du budget
   */
  getBudgetStatus(estimatedBudget, userBudgetMax) {
    if (estimatedBudget <= userBudgetMax * 0.7) {
      return { status: 'under_budget', label: 'Sous le budget', color: 'success' };
    } else if (estimatedBudget <= userBudgetMax) {
      return { status: 'on_budget', label: 'Dans le budget', color: 'warning' };
    } else {
      return { status: 'over_budget', label: 'Dépasse le budget', color: 'danger' };
    }
  }

  /**
   * Mapper une compilation pour l'affichage
   */
  mapCompilationForDisplay(compilation) {
    const budgetInfo = compilation.user_profile ? 
      this.getBudgetStatus(compilation.estimated_budget, compilation.user_profile.budget_max) :
      { status: 'unknown', label: 'Inconnu', color: 'secondary' };

    return {
      ...compilation,
      budget_info: budgetInfo,
      updated_at_formatted: new Date(compilation.updated_at).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      created_at_formatted: new Date(compilation.created_at).toLocaleDateString('fr-FR')
    };
  }

  /**
   * Valider les données d'une compilation
   */
  validateCompilation(compilationData) {
    const errors = {};

    if (!compilationData.name || compilationData.name.trim().length < 2) {
      errors.name = 'Le nom doit contenir au moins 2 caractères';
    }

    if (!compilationData.user_profile_id) {
      errors.user_profile_id = 'Un profil utilisateur est requis';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Valider les données d'un item de compilation
   */
  validateCompilationItem(itemData) {
    const errors = {};

    if (!itemData.attraction_id) {
      errors.attraction_id = 'Une attraction est requise';
    }

    if (itemData.priority && (itemData.priority < 1 || itemData.priority > 5)) {
      errors.priority = 'La priorité doit être entre 1 et 5';
    }

    if (itemData.estimated_cost && itemData.estimated_cost < 0) {
      errors.estimated_cost = 'Le coût estimé ne peut pas être négatif';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// Instance singleton
export const compilationsAPI = new CompilationsAPI();
export default compilationsAPI;