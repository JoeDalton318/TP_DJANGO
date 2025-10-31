import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../contexts/UserProfileContext';
import { Globe, User, Users, Briefcase, Plus, Loader } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { 
    setUserProfile, 
    availableProfiles, 
    loadAvailableProfiles, 
    createProfile,
    loading,
    error 
  } = useUserProfile();
  
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [newProfile, setNewProfile] = useState({
    name: '',
    age: '',
    profile_type: '',
    budget_range: ''
  });

  // Charger les profils au démarrage
  useEffect(() => {
    loadAvailableProfiles();
  }, [loadAvailableProfiles]);

  // Types de profils avec icônes
  const profileTypes = {
    'local': { icon: User, label: 'Explorateur Local', description: 'Je connais bien ma région' },
    'tourist': { icon: Users, label: 'Voyageur Touriste', description: 'Je découvre de nouveaux endroits' },
    'professional': { icon: Briefcase, label: 'Professionnel', description: 'Je voyage pour le travail' },
  };

  // Pays les plus populaires
  const countries = [
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'ES', name: 'Espagne', flag: '🇪🇸' },
    { code: 'IT', name: 'Italie', flag: '🇮🇹' },
    { code: 'GB', name: 'Royaume-Uni', flag: '🇬🇧' },
    { code: 'DE', name: 'Allemagne', flag: '🇩🇪' },
    { code: 'US', name: 'États-Unis', flag: '🇺🇸' },
    { code: 'JP', name: 'Japon', flag: '🇯🇵' },
    { code: 'CN', name: 'Chine', flag: '🇨🇳' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedProfileId && selectedCountry) {
      const countryData = countries.find(c => c.code === selectedCountry);
      setUserProfile(selectedProfileId, countryData);
      navigate('/home');
    }
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    console.log('🔄 Tentative de création de profil:', newProfile);
    try {
      const profile = await createProfile(newProfile);
      console.log('✅ Profil créé avec succès:', profile);
      setSelectedProfileId(profile.id);
      setShowCreateProfile(false);
      setNewProfile({ name: '', age: '', profile_type: '', budget_range: '' });
    } catch (err) {
      console.error('❌ Erreur lors de la création du profil:', err);
      // Afficher l'erreur à l'utilisateur
      alert(`Erreur lors de la création du profil: ${err.message || err}`);
    }
  };

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Header */}
            <div className="text-center mb-5">
              <div className="display-4 text-primary mb-3">
                <Globe size={80} />
              </div>
              <h1 className="display-5 fw-bold text-dark">Trip Explorer</h1>
              <p className="lead text-muted">
                Découvrez les meilleures attractions adaptées à votre profil
              </p>
            </div>

            {/* Formulaire de sélection */}
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                
                {/* Formulaire de création de profil (en dehors du formulaire principal) */}
                {showCreateProfile && (
                  <div className="card mb-4 border-success">
                    <div className="card-body">
                      <h6 className="card-title text-success">Créer un nouveau profil</h6>
                      <form onSubmit={handleCreateProfile}>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Nom</label>
                            <input
                              type="text"
                              className="form-control"
                              value={newProfile.name}
                              onChange={(e) => setNewProfile({...newProfile, name: e.target.value})}
                              required
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Âge</label>
                            <input
                              type="number"
                              className="form-control"
                              value={newProfile.age}
                              onChange={(e) => setNewProfile({...newProfile, age: e.target.value})}
                              min="1"
                              max="120"
                              required
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Type de profil</label>
                            <select
                              className="form-select"
                              value={newProfile.profile_type}
                              onChange={(e) => setNewProfile({...newProfile, profile_type: e.target.value})}
                              required
                            >
                              <option value="">Sélectionnez...</option>
                              {Object.entries(profileTypes).map(([key, type]) => (
                                <option key={key} value={key}>{type.label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Budget</label>
                            <select
                              className="form-select"
                              value={newProfile.budget_range}
                              onChange={(e) => setNewProfile({...newProfile, budget_range: e.target.value})}
                              required
                            >
                              <option value="">Sélectionnez...</option>
                              <option value="low">Économique (0-50€/jour)</option>
                              <option value="medium">Moyen (50-100€/jour)</option>
                              <option value="high">Élevé (100€+/jour)</option>
                            </select>
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <button type="submit" className="btn btn-success btn-sm">
                            Créer le profil
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-secondary btn-sm"
                            onClick={() => setShowCreateProfile(false)}
                          >
                            Annuler
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Sélection du profil */}
                  <div className="mb-5">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4 className="mb-0">Choisissez votre profil</h4>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => setShowCreateProfile(!showCreateProfile)}
                      >
                        <Plus size={16} className="me-1" />
                        Nouveau profil
                      </button>
                    </div>

                    {/* Affichage du loading */}
                    {loading && (
                      <div className="text-center p-4">
                        <Loader className="animate-spin text-primary" size={32} />
                        <p className="mt-2 text-muted">Chargement des profils...</p>
                      </div>
                    )}

                    {/* Affichage des erreurs */}
                    {error && (
                      <div className="alert alert-danger">
                        Erreur lors du chargement des profils : {error}
                      </div>
                    )}

                    {/* Liste des profils existants */}
                    {!loading && availableProfiles && availableProfiles.length > 0 && (
                      <div className="row g-3">
                        {availableProfiles.map((profile) => {
                          const IconComponent = profileTypes[profile.profile_type]?.icon || User;
                          const profileTypeInfo = profileTypes[profile.profile_type];
                          return (
                            <div key={profile.id} className="col-md-4">
                              <div
                                className={`card h-100 cursor-pointer ${
                                  selectedProfileId === profile.id ? 'border-primary bg-primary bg-opacity-10' : 'border-light'
                                }`}
                                onClick={() => setSelectedProfileId(profile.id)}
                                style={{ cursor: 'pointer' }}
                              >
                                <div className="card-body text-center p-4">
                                  <IconComponent 
                                    size={40} 
                                    className={`mb-3 ${selectedProfileId === profile.id ? 'text-primary' : 'text-muted'}`} 
                                  />
                                  <h6 className="card-title">{profile.name}</h6>
                                  <small className="text-muted d-block">
                                    {profileTypeInfo?.label || profile.profile_type}
                                  </small>
                                  <small className="text-muted">
                                    {profile.age} ans • Budget {profile.budget_range}
                                  </small>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Message si aucun profil */}
                    {!loading && (!availableProfiles || availableProfiles.length === 0) && (
                      <div className="text-center p-4 border border-dashed rounded">
                        <User size={48} className="text-muted mb-3" />
                        <p className="text-muted">Aucun profil disponible.</p>
                        <p className="text-muted">Créez votre premier profil pour commencer !</p>
                      </div>
                    )}
                  </div>

                  {/* Sélection du pays */}
                  <div className="mb-5">
                    <h4 className="text-center mb-4">Quelle destination vous intéresse ?</h4>
                    <div className="row g-2">
                      {countries.map((country) => (
                        <div key={country.code} className="col-6 col-md-3">
                          <div
                            className={`card cursor-pointer ${
                              selectedCountry === country.code ? 'border-primary bg-primary bg-opacity-10' : 'border-light'
                            }`}
                            onClick={() => setSelectedCountry(country.code)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="card-body text-center p-3">
                              <div className="fs-2 mb-2">{country.flag}</div>
                              <small className="fw-medium">{country.name}</small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bouton de validation */}
                  <div className="text-center">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg px-5"
                      disabled={!selectedProfileId || !selectedCountry}
                    >
                      Commencer l'exploration
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4">
              <small className="text-muted">
                Powered by TripAdvisor API • Développé avec React + Django
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;