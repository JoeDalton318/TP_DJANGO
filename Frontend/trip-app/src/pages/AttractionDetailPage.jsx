import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCompilation } from '../contexts/CompilationContext';
import { 
  ArrowLeft, Star, MapPin, Phone, Globe, Clock, Camera, 
  Users, Heart, Share2, Navigation, Award, CreditCard, Home
} from 'lucide-react';
import { attractionsAPI } from '../services/api';

const AttractionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addAttraction, removeAttraction, isInCompilation } = useCompilation();
  
  const [attraction, setAttraction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadAttractionDetails();
  }, [id]);

  const loadAttractionDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Utiliser l'API spécifique pour les détails
      const attractionData = await attractionsAPI.getAttractionDetails(id);
      setAttraction(attractionData);
    } catch (err) {
      console.error('Erreur chargement détails:', err);
      setError('Erreur lors du chargement des détails');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCompilation = () => {
    if (isInCompilation(attraction.id)) {
      removeAttraction(attraction.id);
    } else {
      addAttraction(attraction);
    }
  };

  const getPriceDisplay = (priceLevel) => {
    if (!priceLevel) return 'Prix non spécifié';
    const symbols = priceLevel.replace(/[€$]/g, '');
    switch (symbols.length) {
      case 1: return '€ - Économique';
      case 2: return '€€ - Modéré';
      case 3: return '€€€ - Cher';
      case 4: return '€€€€ - Très cher';
      default: return 'Prix non spécifié';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'hotel': return <Home size={20} />;
      case 'restaurant': return <Users size={20} />;
      case 'attraction': return <Camera size={20} />;
      default: return <MapPin size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p>Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (error || !attraction) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="text-danger mb-3">
            <MapPin size={48} />
          </div>
          <h4>Attraction non trouvée</h4>
          <p className="text-muted">{error}</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/search')}
          >
            Retour à la recherche
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Header avec navigation */}
      <div className="bg-white shadow-sm sticky-top">
        <div className="container py-3">
          <div className="row align-items-center">
            <div className="col">
              <button 
                className="btn btn-outline-secondary me-3"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={20} />
              </button>
              <span className="h5 mb-0">{attraction.name}</span>
            </div>
            <div className="col-auto">
              <div className="d-flex gap-2">
                <button 
                  className={`btn ${isInCompilation(attraction.id) ? 'btn-danger' : 'btn-outline-danger'}`}
                  onClick={handleToggleCompilation}
                >
                  <Heart size={16} className="me-1" fill={isInCompilation(attraction.id) ? 'currentColor' : 'none'} />
                  {isInCompilation(attraction.id) ? 'Retirer' : 'Ajouter'}
                </button>
                <button className="btn btn-outline-secondary">
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-4">
        <div className="row">
          {/* Colonne principale */}
          <div className="col-lg-8">
            {/* Images */}
            <div className="card mb-4">
              <div className="position-relative">
                <img
                  src={attraction.main_image || 'https://via.placeholder.com/800x400?text=Attraction'}
                  className="card-img-top"
                  alt={attraction.name}
                  style={{ height: '400px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x400?text=Attraction';
                  }}
                />
                {attraction.num_photos > 1 && (
                  <div className="position-absolute bottom-0 end-0 m-3">
                    <span className="badge bg-dark bg-opacity-75">
                      <Camera size={14} className="me-1" />
                      {attraction.num_photos} photos
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Informations principales */}
            <div className="card mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h1 className="h3 mb-2">{attraction.name}</h1>
                    <div className="d-flex align-items-center text-muted mb-2">
                      {getCategoryIcon(attraction.category)}
                      <span className="ms-2">{attraction.subcategory || attraction.category}</span>
                    </div>
                    <div className="d-flex align-items-center text-muted">
                      <MapPin size={16} className="me-1" />
                      {attraction.address || `${attraction.city}, ${attraction.country}`}
                    </div>
                  </div>
                  {attraction.rating && (
                    <div className="text-end">
                      <div className="d-flex align-items-center mb-1">
                        <Star size={20} className="text-warning me-1" fill="currentColor" />
                        <span className="h5 mb-0">{attraction.rating}</span>
                      </div>
                      <small className="text-muted">
                        {attraction.num_reviews?.toLocaleString()} avis
                      </small>
                    </div>
                  )}
                </div>

                {/* Récompenses */}
                {attraction.awards && attraction.awards.length > 0 && (
                  <div className="mb-3">
                    <div className="d-flex flex-wrap gap-2">
                      {attraction.awards.slice(0, 3).map((award, index) => (
                        <span key={index} className="badge bg-warning text-dark">
                          <Award size={12} className="me-1" />
                          {award.display_name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {attraction.description && (
                  <div className="mb-4">
                    <h5>Description</h5>
                    <p className="text-muted">{attraction.description}</p>
                  </div>
                )}

                {/* Types de voyage */}
                {attraction.trip_types && attraction.trip_types.length > 0 && (
                  <div className="mb-4">
                    <h6>Populaire auprès des :</h6>
                    <div className="row g-2">
                      {attraction.trip_types.slice(0, 4).map((type, index) => (
                        <div key={index} className="col-6 col-md-3">
                          <div className="text-center p-2 bg-light rounded">
                            <div className="fw-medium">{type.localized_name}</div>
                            <small className="text-muted">{type.value} mentions</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Évaluations détaillées */}
            {attraction.subratings && Object.keys(attraction.subratings).length > 0 && (
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title">Évaluations détaillées</h5>
                  <div className="row g-3">
                    {Object.values(attraction.subratings).map((rating, index) => (
                      <div key={index} className="col-6 col-md-4">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="small">{rating.localized_name}</span>
                          <div className="d-flex align-items-center">
                            <Star size={14} className="text-warning me-1" fill="currentColor" />
                            <span className="fw-medium">{rating.value}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            {/* Informations pratiques */}
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Informations pratiques</h5>
                
                {/* Localisation */}
                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <MapPin size={16} className="text-primary me-2" />
                    <strong>Adresse</strong>
                  </div>
                  <p className="ms-4 mb-0 text-muted small">
                    {attraction.address || `${attraction.city}, ${attraction.country}`}
                  </p>
                </div>

                {/* Téléphone */}
                {attraction.phone && (
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <Phone size={16} className="text-primary me-2" />
                      <strong>Téléphone</strong>
                    </div>
                    <p className="ms-4 mb-0 text-muted small">{attraction.phone}</p>
                  </div>
                )}

                {/* Site web */}
                {attraction.website && (
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <Globe size={16} className="text-primary me-2" />
                      <strong>Site web</strong>
                    </div>
                    <a 
                      href={attraction.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ms-4 text-decoration-none small"
                    >
                      Voir le site officiel
                    </a>
                  </div>
                )}

                {/* Prix */}
                {attraction.price_level && (
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <CreditCard size={16} className="text-primary me-2" />
                      <strong>Gamme de prix</strong>
                    </div>
                    <p className="ms-4 mb-0 text-muted small">
                      {getPriceDisplay(attraction.price_level)}
                    </p>
                  </div>
                )}

                {/* Classement */}
                {attraction.ranking && (
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <Award size={16} className="text-primary me-2" />
                      <strong>Classement</strong>
                    </div>
                    <p className="ms-4 mb-0 text-muted small">
                      #{attraction.ranking} dans {attraction.city}
                    </p>
                  </div>
                )}

                {/* Boutons d'action */}
                <div className="d-grid gap-2 mt-4">
                  <button 
                    className={`btn ${isInCompilation(attraction.id) ? 'btn-danger' : 'btn-primary'}`}
                    onClick={handleToggleCompilation}
                  >
                    <Heart size={16} className="me-2" fill={isInCompilation(attraction.id) ? 'currentColor' : 'none'} />
                    {isInCompilation(attraction.id) ? 'Retirer de ma liste' : 'Ajouter à ma liste'}
                  </button>
                  <button className="btn btn-outline-primary">
                    <Navigation size={16} className="me-2" />
                    Itinéraire
                  </button>
                </div>
              </div>
            </div>

            {/* Équipements */}
            {attraction.amenities && attraction.amenities.length > 0 && (
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Équipements</h5>
                  <div className="d-flex flex-wrap gap-1">
                    {attraction.amenities.slice(0, 10).map((amenity, index) => (
                      <span key={index} className="badge bg-light text-dark small">
                        {amenity}
                      </span>
                    ))}
                    {attraction.amenities.length > 10 && (
                      <span className="badge bg-secondary small">
                        +{attraction.amenities.length - 10} autres
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttractionDetailPage;