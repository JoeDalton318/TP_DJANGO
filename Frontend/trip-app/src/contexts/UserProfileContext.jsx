import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { profilesAPI } from '../services/profilesAPI';
import { useAuth } from './AuthContext';

const UserProfileContext = createContext();

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

export const UserProfileProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [availableProfiles, setAvailableProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger les profils disponibles au démarrage et quand l'utilisateur change
  useEffect(() => {
    const loadInitialData = async () => {
      if (isAuthenticated() && user) {
        try {
          setLoading(true);
          setError(null);
          
          // Charger les profils disponibles
          const profiles = await profilesAPI.getProfiles();
          setAvailableProfiles(profiles);
          
          // Restaurer depuis localStorage si existant
          const savedProfileId = localStorage.getItem(`currentProfileId_${user.id}`);
          const savedCountry = localStorage.getItem(`selectedCountry_${user.id}`);
          
          if (savedProfileId && savedCountry) {
            const profileData = await profilesAPI.getProfile(savedProfileId);
            setProfile(profileData);
            setSelectedCountry(JSON.parse(savedCountry));
          }
        } catch (err) {
          console.error('Erreur lors du chargement initial:', err);
          setError('Impossible de charger les données du profil');
        } finally {
          setLoading(false);
        }
      } else {
        // Réinitialiser si l'utilisateur n'est pas connecté
        setProfile(null);
        setSelectedCountry(null);
        setAvailableProfiles([]);
      }
    };

    loadInitialData();
  }, [user, isAuthenticated]);

  const loadAvailableProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const profiles = await profilesAPI.getProfiles();
      setAvailableProfiles(profiles);
    } catch (err) {
      console.error('Erreur lors du chargement des profils:', err);
      setError('Impossible de charger les profils');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProfile = useCallback(async (profileId) => {
    try {
      setLoading(true);
      setError(null);
      const profileData = await profilesAPI.getProfile(profileId);
      setProfile(profileData);
      
      // Stocker par utilisateur connecté
      if (user) {
        localStorage.setItem(`currentProfileId_${user.id}`, profileId);
      }
    } catch (err) {
      console.error('Erreur lors du chargement du profil:', err);
      setError('Impossible de charger le profil');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createProfile = async (profileData) => {
    console.log('🏁 Début createProfile dans le contexte:', profileData);
    try {
      setLoading(true);
      setError(null);
      
      // Valider les données
      const validation = profilesAPI.validateProfile(profileData);
      console.log('✅ Validation:', validation);
      if (!validation.isValid) {
        throw new Error('Données invalides: ' + Object.values(validation.errors).join(', '));
      }
      
      const newProfile = await profilesAPI.createProfile(profileData);
      console.log('🎉 Nouveau profil reçu dans le contexte:', newProfile);
      setProfile(newProfile);
      
      // Recharger la liste des profils
      await loadAvailableProfiles();
      
      // Stocker par utilisateur connecté
      if (user) {
        localStorage.setItem(`currentProfileId_${user.id}`, newProfile.id);
      }
      
      return newProfile;
    } catch (err) {
      console.error('💥 Erreur dans createProfile contexte:', err);
      setError(err.message || 'Erreur lors de la création du profil');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileId, updates) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedProfile = await profilesAPI.updateProfile(profileId, updates);
      
      // Mettre à jour le profil actuel si c'est le même
      if (profile && profile.id === profileId) {
        setProfile(updatedProfile);
      }
      
      // Recharger la liste des profils
      await loadAvailableProfiles();
      
      return updatedProfile;
    } catch (err) {
      console.error('Erreur lors de la mise à jour du profil:', err);
      setError('Erreur lors de la mise à jour du profil');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProfile = async (profileId) => {
    try {
      setLoading(true);
      setError(null);
      
      await profilesAPI.deleteProfile(profileId);
      
      // Si c'est le profil actuel, le déconnecter
      if (profile && profile.id === profileId) {
        clearProfile();
      }
      
      // Recharger la liste des profils
      await loadAvailableProfiles();
      
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression du profil:', err);
      setError('Erreur lors de la suppression du profil');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const setUserProfile = (profileId, country) => {
    loadProfile(profileId);
    setSelectedCountry(country);
    
    // Stocker par utilisateur connecté
    if (user) {
      localStorage.setItem(`selectedCountry_${user.id}`, JSON.stringify(country));
    }
  };

  const clearProfile = () => {
    setProfile(null);
    setSelectedCountry(null);
    
    // Nettoyer par utilisateur connecté
    if (user) {
      localStorage.removeItem(`currentProfileId_${user.id}`);
      localStorage.removeItem(`selectedCountry_${user.id}`);
      localStorage.removeItem(`compilation_${user.id}`); // Vider aussi la compilation ancienne
    }
  };

  const isProfileSet = () => {
    return profile && selectedCountry;
  };

  const getProfileCompilations = async () => {
    if (!profile) return [];
    
    try {
      return await profilesAPI.getProfileCompilations(profile.id);
    } catch (err) {
      console.error('Erreur lors du chargement des compilations du profil:', err);
      return [];
    }
  };

  // Mappers pour compatibilité avec l'ancien système
  const getProfileTypeLabel = (type) => {
    const labels = {
      'local': 'Explorateur Local',
      'tourist': 'Voyageur Touriste', 
      'professional': 'Professionnel en Déplacement'
    };
    return labels[type] || type;
  };

  const getBudgetRangeLabel = (range) => {
    const labels = {
      'low': '0-100€',
      'medium': '100-500€',
      'high': '500-1000€',
      'luxury': '1000€+'
    };
    return labels[range] || range;
  };

  const value = {
    // État
    profile,
    selectedCountry,
    availableProfiles,
    loading,
    error,
    
    // Actions de base
    setUserProfile,
    clearProfile,
    isProfileSet,
    
    // Actions API
    loadAvailableProfiles,
    loadProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    getProfileCompilations,
    
    // Helpers
    getProfileTypeLabel,
    getBudgetRangeLabel,
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};