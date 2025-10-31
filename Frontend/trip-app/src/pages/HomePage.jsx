import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useCompilation } from '../contexts/CompilationContext';
import { ChevronLeft, ChevronRight, Star, MapPin, Camera, Users, Search, List, Heart, User } from 'lucide-react';
import { attractionsAPI } from '../services/api';

const HomePage = () => {
  const navigate = useNavigate();
  const { profile, selectedCountry, clearProfile } = useUserProfile();
  const { getCompilationCount } = useCompilation();
  const [popularAttractions, setPopularAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    loadPopularAttractions();
  }, [selectedCountry]);

  const loadPopularAttractions = async () => {
    try {
      setLoading(true);
      const response = await attractionsAPI.getPopularAttractions({
        country: selectedCountry?.name,
        limit: 10
      });
      setPopularAttractions(response.data || []);
    } catch (error) {
      console.error('Erreur chargement attractions:', error);
      setPopularAttractions([]);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.max(1, popularAttractions.length - 2));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.max(1, popularAttractions.length - 2)) % Math.max(1, popularAttractions.length - 2));
  };

  const getProfileIcon = () => {
    switch (profile) {
      case 'local': return <User size={20} />;
      case 'tourist': return <Camera size={20} />;
      case 'professional': return <Users size={20} />;
      default: return <User size={20} />;
    }
  };

  const getProfileLabel = () => {
    switch (profile) {
      case 'local': return 'Local';
      case 'tourist': return 'Touriste';
      case 'professional': return 'Professionnel';
      default: return 'Utilisateur';
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p>Chargement des attractions populaires...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Header avec profil */}
      <header className="bg-primary text-white py-3">
        <div className="container">
          <div className="row align-items-center">
            <div className="col">
              <h1 className="h4 mb-0">Trip Explorer</h1>
              <small className="opacity-75">
                {getProfileIcon()} {getProfileLabel()} • {selectedCountry?.flag} {selectedCountry?.name}
              </small>
            </div>
            <div className="col-auto">
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-light btn-sm"
                  onClick={() => navigate('/search')}
                >
                  <Search size={16} className="me-1" />
                  Rechercher
                </button>
                <button
                  className="btn btn-outline-light btn-sm position-relative"
                  onClick={() => navigate('/compilation')}
                >
                  <Heart size={16} className="me-1" />
                  Ma Liste
                  {getCompilationCount() > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {getCompilationCount()}
                    </span>
                  )}
                </button>
                <button
                  className="btn btn-outline-light btn-sm"
                  onClick={clearProfile}
                >
                  Changer
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="container py-5">
        {/* Titre de section */}
        <div className="text-center mb-5">
          <h2 className="display-6 fw-bold">Attractions Populaires</h2>
          <p className="lead text-muted">
            Découvrez les meilleures attractions de {selectedCountry?.name} recommandées pour les {getProfileLabel().toLowerCase()}s
          </p>
        </div>

        {/* Carrousel d'attractions */}
        {popularAttractions.length > 0 ? (
          <div className="position-relative mb-5">
            <div className="row g-4">
              {popularAttractions.slice(currentSlide, currentSlide + 3).map((attraction, index) => (
                <div key={attraction.id} className="col-lg-4">
                  <div 
                    className="card h-100 shadow-sm attraction-card"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/attraction/${attraction.id}`)}
                  >
                    <img
                      src={attraction.main_image || '/placeholder-attraction.jpg'}
                      className="card-img-top"
                      alt={attraction.name}
                      style={{ height: '200px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x200?text=Attraction';
                      }}
                    />
                    <div className="card-body">
                      <h5 className="card-title">{attraction.name}</h5>
                      <p className="text-muted small mb-2">
                        <MapPin size={14} className="me-1" />
                        {attraction.city}, {attraction.country}
                      </p>
                      
                      {/* Rating */}
                      {attraction.rating && (
                        <div className="d-flex align-items-center mb-2">
                          <div className="d-flex me-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < Math.floor(attraction.rating) ? 'text-warning' : 'text-muted'}
                                fill={i < Math.floor(attraction.rating) ? 'currentColor' : 'none'}
                              />
                            ))}
                          </div>
                          <small className="text-muted">
                            {attraction.rating} ({attraction.num_reviews?.toLocaleString()} avis)
                          </small>
                        </div>
                      )}

                      {/* Description */}
                      <p className="card-text small">
                        {attraction.description ? 
                          attraction.description.substring(0, 100) + '...' : 
                          'Découvrez cette attraction incontournable'
                        }
                      </p>

                      {/* Catégorie */}
                      <span className="badge bg-secondary">
                        {attraction.subcategory || attraction.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Contrôles du carrousel */}
            {popularAttractions.length > 3 && (
              <>
                <button
                  className="btn btn-primary position-absolute top-50 start-0 translate-middle-y"
                  onClick={prevSlide}
                  style={{ left: '-20px' }}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  className="btn btn-primary position-absolute top-50 end-0 translate-middle-y"
                  onClick={nextSlide}
                  style={{ right: '-20px' }}
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Indicateurs */}
            {popularAttractions.length > 3 && (
              <div className="d-flex justify-content-center mt-4">
                {Array.from({ length: Math.max(1, popularAttractions.length - 2) }, (_, i) => (
                  <button
                    key={i}
                    className={`btn btn-sm mx-1 ${i === currentSlide ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setCurrentSlide(i)}
                    style={{ width: '12px', height: '12px', padding: 0 }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-5">
            <MapPin size={48} className="text-muted mb-3" />
            <h5>Aucune attraction trouvée</h5>
            <p className="text-muted">Essayez de rechercher manuellement ou changez de destination.</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/search')}
            >
              Commencer une recherche
            </button>
          </div>
        )}

        {/* Actions rapides */}
        <div className="row g-4 mt-5">
          <div className="col-md-6">
            <div className="card text-center h-100">
              <div className="card-body py-5">
                <Search size={48} className="text-primary mb-3" />
                <h5>Recherche Avancée</h5>
                <p className="text-muted">Utilisez nos filtres pour trouver exactement ce que vous cherchez</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/search')}
                >
                  Rechercher
                </button>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card text-center h-100">
              <div className="card-body py-5">
                <Heart size={48} className="text-danger mb-3" />
                <h5>Ma Compilation</h5>
                <p className="text-muted">
                  {getCompilationCount() > 0 ? 
                    `${getCompilationCount()} attraction${getCompilationCount() > 1 ? 's' : ''} dans votre liste` :
                    'Créez votre liste personnalisée d\'attractions'
                  }
                </p>
                <button 
                  className="btn btn-outline-danger"
                  onClick={() => navigate('/compilation')}
                >
                  <List size={16} className="me-1" />
                  Voir ma liste
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;