import React, { useState, useEffect } from 'react';
import { X, Star, MapPin, Users, Camera, ExternalLink, Clock, Phone, Globe } from 'lucide-react';
import { attractionsAPI } from '../services/api';

const AttractionModal = ({ attraction, isOpen, onClose }) => {
  const [attractionDetails, setAttractionDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && attraction && attraction.tripadvisor_id) {
      fetchAttractionDetails();
    }
  }, [isOpen, attraction]);

  const fetchAttractionDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const details = await attractionsAPI.getAttractionDetails(attraction.tripadvisor_id);
      setAttractionDetails(details);
    } catch (err) {
      setError(err.message);
      console.error('Erreur détails attraction:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={16} className="text-warning" fill="currentColor" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" size={16} className="text-warning" />);
    }
    
    return (
      <div className="d-flex align-items-center">
        <div className="me-2">{stars}</div>
        <span className="fw-bold me-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  if (!isOpen) return null;

  const data = attractionDetails || attraction;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header">
            <h5 className="modal-title">{data.name}</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              aria-label="Fermer"
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body">
            {loading && (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Chargement des détails...</span>
                </div>
                <div className="mt-2">Chargement des détails...</div>
              </div>
            )}

            {error && (
              <div className="alert alert-warning">
                <strong>Informations limitées disponibles</strong>
                <p className="mb-0">{error}</p>
              </div>
            )}

            {/* Image principale */}
            {data.main_image && (
              <div className="mb-3">
                <img 
                  src={data.main_image} 
                  alt={data.name}
                  className="img-fluid rounded"
                  style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }}
                />
              </div>
            )}

            {/* Informations de base */}
            <div className="row mb-3">
              <div className="col-md-8">
                {/* Localisation */}
                {(data.city || data.country) && (
                  <p className="text-muted d-flex align-items-center mb-2">
                    <MapPin size={16} className="me-2" />
                    {data.city && data.country 
                      ? `${data.city}, ${data.country}` 
                      : (data.city || data.country)
                    }
                  </p>
                )}

                {/* Rating */}
                {data.rating && (
                  <div className="d-flex align-items-center mb-2">
                    {renderStars(data.rating)}
                    {data.num_reviews && (
                      <span className="text-muted ms-2">
                        ({data.num_reviews.toLocaleString()} avis)
                      </span>
                    )}
                  </div>
                )}

                {/* Catégorie */}
                {data.category && (
                  <span className="badge bg-primary me-2 mb-2">{data.category}</span>
                )}

                {/* Distance (si recherche géolocalisée) */}
                {data.distance && (
                  <span className="badge bg-success mb-2">
                    {parseFloat(data.distance).toFixed(1)} km
                    {data.bearing && ` (${data.bearing})`}
                  </span>
                )}
              </div>

              <div className="col-md-4">
                {/* Prix */}
                {data.price_level && (
                  <div className="mb-2">
                    <strong>Niveau de prix:</strong>
                    <div>
                      {'€'.repeat(data.price_level)}
                      <span className="text-muted">{'€'.repeat(4 - data.price_level)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {data.description && (
              <div className="mb-3">
                <h6>Description</h6>
                <p>{data.description}</p>
              </div>
            )}

            {/* Informations de contact */}
            {(data.phone || data.website) && (
              <div className="mb-3">
                <h6>Contact</h6>
                {data.phone && (
                  <p className="d-flex align-items-center mb-1">
                    <Phone size={16} className="me-2" />
                    <a href={`tel:${data.phone}`}>{data.phone}</a>
                  </p>
                )}
                {data.website && (
                  <p className="d-flex align-items-center mb-1">
                    <Globe size={16} className="me-2" />
                    <a href={data.website} target="_blank" rel="noopener noreferrer">
                      Site web
                    </a>
                  </p>
                )}
              </div>
            )}

            {/* Horaires */}
            {data.hours && Object.keys(data.hours).length > 0 && (
              <div className="mb-3">
                <h6 className="d-flex align-items-center">
                  <Clock size={16} className="me-2" />
                  Horaires
                </h6>
                <div className="small">
                  {Object.entries(data.hours).map(([day, hours]) => (
                    <div key={day} className="d-flex justify-content-between">
                      <span className="fw-medium">{day}:</span>
                      <span>{hours || 'Fermé'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cuisines (pour restaurants) */}
            {data.cuisine && data.cuisine.length > 0 && (
              <div className="mb-3">
                <h6>Cuisine</h6>
                <div>
                  {data.cuisine.map((cuisine, index) => (
                    <span key={index} className="badge bg-secondary me-1 mb-1">
                      {cuisine.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Restrictions alimentaires */}
            {data.dietary_restrictions && data.dietary_restrictions.length > 0 && (
              <div className="mb-3">
                <h6>Options alimentaires</h6>
                <div>
                  {data.dietary_restrictions.map((restriction, index) => (
                    <span key={index} className="badge bg-info me-1 mb-1">
                      {restriction.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Galerie d'images */}
            {data.images && data.images.length > 1 && (
              <div className="mb-3">
                <h6 className="d-flex align-items-center">
                  <Camera size={16} className="me-2" />
                  Galerie ({data.images.length} photos)
                </h6>
                <div className="row g-2">
                  {data.images.slice(0, 6).map((image, index) => (
                    <div key={index} className="col-4">
                      <img 
                        src={image.url || image} 
                        alt={`${data.name} ${index + 1}`}
                        className="img-fluid rounded"
                        style={{ height: '80px', width: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
                {data.images.length > 6 && (
                  <small className="text-muted">
                    ... et {data.images.length - 6} photos de plus
                  </small>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              Fermer
            </button>
            {data.tripadvisor_id && (
              <a
                href={`https://www.tripadvisor.com/Attraction_Review-g-d${data.tripadvisor_id}.html`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <ExternalLink size={16} className="me-1" />
                Voir sur TripAdvisor
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttractionModal;