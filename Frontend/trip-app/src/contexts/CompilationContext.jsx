import React, { createContext, useContext, useState, useEffect } from 'react';
import { compilationsAPI } from '../services/compilationsAPI';
import { useUserProfile } from './UserProfileContext';

const CompilationContext = createContext();

export const useCompilation = () => {
  const context = useContext(CompilationContext);
  if (!context) {
    throw new Error('useCompilation must be used within a CompilationProvider');
  }
  return context;
};

export const CompilationProvider = ({ children }) => {
  const { profile } = useUserProfile();
  const [currentCompilation, setCurrentCompilation] = useState(null);
  const [userCompilations, setUserCompilations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger les compilations de l'utilisateur quand le profil change
  useEffect(() => {
    if (profile) {
      loadUserCompilations();
      loadOrCreateDefaultCompilation();
    } else {
      setCurrentCompilation(null);
      setUserCompilations([]);
    }
  }, [profile]);

  const loadUserCompilations = async () => {
    if (!profile) return;
    
    try {
      setError(null);
      const compilations = await compilationsAPI.getCompilationsByProfile(profile.id);
      setUserCompilations(compilations);
    } catch (err) {
      console.error('Erreur lors du chargement des compilations:', err);
      setError('Impossible de charger les compilations');
    }
  };

  const loadOrCreateDefaultCompilation = async () => {
    if (!profile) return;

    try {
      setLoading(true);
      setError(null);
      
      // Vérifier s'il y a une compilation par défaut
      const compilations = await compilationsAPI.getCompilationsByProfile(profile.id);
      let defaultCompilation = compilations.find(c => c.name === 'Ma compilation');
      
      if (!defaultCompilation) {
        // Créer une compilation par défaut
        defaultCompilation = await compilationsAPI.createCompilation({
          name: 'Ma compilation',
          description: 'Ma liste d\'attractions favorites',
          user_profile_id: profile.id
        });
      } else {
        // Charger les détails complets
        defaultCompilation = await compilationsAPI.getCompilation(defaultCompilation.id);
      }
      
      setCurrentCompilation(defaultCompilation);
    } catch (err) {
      console.error('Erreur lors de la création/chargement de la compilation:', err);
      setError('Impossible de créer la compilation');
    } finally {
      setLoading(false);
    }
  };

  const createCompilation = async (compilationData) => {
    if (!profile) throw new Error('Aucun profil utilisateur sélectionné');

    try {
      setLoading(true);
      setError(null);
      
      const newCompilation = await compilationsAPI.createCompilation({
        ...compilationData,
        user_profile_id: profile.id
      });
      
      // Recharger les compilations
      await loadUserCompilations();
      
      return newCompilation;
    } catch (err) {
      console.error('Erreur lors de la création de la compilation:', err);
      setError(err.message || 'Erreur lors de la création de la compilation');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const selectCompilation = async (compilationId) => {
    try {
      setLoading(true);
      setError(null);
      
      const compilation = await compilationsAPI.getCompilation(compilationId);
      setCurrentCompilation(compilation);
    } catch (err) {
      console.error('Erreur lors de la sélection de la compilation:', err);
      setError('Impossible de charger la compilation');
    } finally {
      setLoading(false);
    }
  };

  const addAttraction = async (attraction, options = {}) => {
    if (!currentCompilation) {
      throw new Error('Aucune compilation active');
    }

    try {
      setLoading(true);
      setError(null);
      
      const itemData = {
        attraction_id: attraction.id,
        priority: options.priority || 1,
        personal_note: options.note || '',
        estimated_cost: options.estimatedCost
      };
      
      await compilationsAPI.addAttractionToCompilation(currentCompilation.id, itemData);
      
      // Recharger la compilation pour obtenir les données mises à jour
      const updatedCompilation = await compilationsAPI.getCompilation(currentCompilation.id);
      setCurrentCompilation(updatedCompilation);
      
      return true;
    } catch (err) {
      console.error('Erreur lors de l\'ajout de l\'attraction:', err);
      setError(err.message || 'Impossible d\'ajouter l\'attraction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeAttraction = async (attractionId) => {
    if (!currentCompilation) {
      throw new Error('Aucune compilation active');
    }

    try {
      setLoading(true);
      setError(null);
      
      await compilationsAPI.removeAttractionFromCompilation(currentCompilation.id, attractionId);
      
      // Recharger la compilation
      const updatedCompilation = await compilationsAPI.getCompilation(currentCompilation.id);
      setCurrentCompilation(updatedCompilation);
      
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'attraction:', err);
      setError(err.message || 'Impossible de supprimer l\'attraction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCompilation = async (compilationId, updates) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedCompilation = await compilationsAPI.updateCompilation(compilationId, updates);
      
      // Mettre à jour la compilation actuelle si c'est la même
      if (currentCompilation && currentCompilation.id === compilationId) {
        setCurrentCompilation(updatedCompilation);
      }
      
      // Recharger les compilations utilisateur
      await loadUserCompilations();
      
      return updatedCompilation;
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la compilation:', err);
      setError('Erreur lors de la mise à jour');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCompilation = async (compilationId) => {
    try {
      setLoading(true);
      setError(null);
      
      await compilationsAPI.deleteCompilation(compilationId);
      
      // Si c'est la compilation actuelle, la déselectionner
      if (currentCompilation && currentCompilation.id === compilationId) {
        setCurrentCompilation(null);
        // Recharger une compilation par défaut
        await loadOrCreateDefaultCompilation();
      }
      
      // Recharger les compilations
      await loadUserCompilations();
      
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression de la compilation:', err);
      setError('Erreur lors de la suppression');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const markAsVisited = async (itemId) => {
    try {
      await compilationsAPI.markItemAsVisited(itemId);
      
      // Recharger la compilation
      if (currentCompilation) {
        const updatedCompilation = await compilationsAPI.getCompilation(currentCompilation.id);
        setCurrentCompilation(updatedCompilation);
      }
    } catch (err) {
      console.error('Erreur lors du marquage comme visité:', err);
      throw err;
    }
  };

  const clearCompilation = async () => {
    if (!currentCompilation) return;

    try {
      setLoading(true);
      setError(null);
      
      // Supprimer tous les items (ou créer une nouvelle compilation vide)
      await deleteCompilation(currentCompilation.id);
      
    } catch (err) {
      console.error('Erreur lors du vidage de la compilation:', err);
      setError('Erreur lors du vidage');
    } finally {
      setLoading(false);
    }
  };

  // Helpers pour compatibilité avec l'ancien système
  const isInCompilation = (attractionId) => {
    if (!currentCompilation || !currentCompilation.items) return false;
    return currentCompilation.items.some(item => 
      item.attraction && item.attraction.id === attractionId && item.is_active
    );
  };

  const getCompilationCount = () => {
    return currentCompilation ? currentCompilation.total_items : 0;
  };

  const getTotalBudget = () => {
    return currentCompilation ? currentCompilation.estimated_budget : 0;
  };

  const getCompiledAttractions = () => {
    if (!currentCompilation || !currentCompilation.items) return [];
    return currentCompilation.items
      .filter(item => item.is_active)
      .map(item => ({
        ...item.attraction,
        addedAt: item.added_at,
        personal_note: item.personal_note,
        priority: item.priority,
        effective_cost: item.effective_cost,
        is_visited: item.is_visited,
        item_id: item.id
      }));
  };

  const getBudgetStatus = () => {
    if (!currentCompilation || !profile) return null;
    return compilationsAPI.getBudgetStatus(
      currentCompilation.estimated_budget, 
      profile.budget_max
    );
  };

  const value = {
    // État principal
    currentCompilation,
    userCompilations,
    loading,
    error,
    
    // Actions sur les compilations
    createCompilation,
    selectCompilation,
    updateCompilation,
    deleteCompilation,
    loadUserCompilations,
    
    // Actions sur les attractions
    addAttraction,
    removeAttraction,
    markAsVisited,
    clearCompilation,
    
    // Helpers (compatibilité)
    isInCompilation,
    getCompilationCount,
    getTotalBudget,
    getCompiledAttractions,
    getBudgetStatus,
    
    // Données calculées
    compiledAttractions: getCompiledAttractions(), // Pour compatibilité
  };

  return (
    <CompilationContext.Provider value={value}>
      {children}
    </CompilationContext.Provider>
  );
};