import React, { useState, useEffect } from 'react';
import { 
  X, Star, MapPin, Users, Camera, Clock, Phone, Globe, Award, 
  Heart, Info, ChevronLeft, ChevronRight, Calendar, Euro 
} from 'lucide-react';

const AttractionModal = ({ attraction, isOpen, onClose }) => {
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoadingPhotos(true);
        const response = await fetch(`http://127.0.0.1:8000/api/attractions/photos/${attraction.tripadvisor_id}/`);
        if (response.ok) {
          const data = await response.json();
          setPhotos(data.photos || []);
        }
      } catch (err) {
        console.error('Erreur récupération photos:', err);
      } finally {
        setLoadingPhotos(false);
      }
    };

    if (isOpen && attraction && attraction.tripadvisor_id) {
      fetchPhotos();
    }
  }, [isOpen, attraction]);

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

  const renderPriceLevel = (price_level) => {
    if (!price_level) return null;
    
    // Gérer les prix avec des €
    if (typeof price_level === 'string' && price_level.includes('€')) {
      return (
        <div className="d-flex align-items-center">
          <Euro size={16} className="me-1" />
          <span className="fw-bold">{price_level}</span>
        </div>
      );
    }
    
    // Gérer les prix numériques
    const levels = {
      1: { text: 'Économique', color: 'success' },
      2: { text: 'Modéré', color: 'warning' },
      3: { text: 'Cher', color: 'danger' },
      4: { text: 'Très cher', color: 'danger' }
    };
    
    const level = levels[price_level];
    if (!level) return null;
    
    return (
      <div className="d-flex align-items-center">
        <Euro size={16} className="me-1" />
        <span className="fw-bold me-1">{'€'.repeat(price_level)}</span>
        <span className={`badge bg-${level.color}`}>{level.text}</span>
      </div>
    );
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  if (!isOpen) return null;

  const data = attraction;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header">
            <h5 className="modal-title d-flex align-items-center">
              {data.name}
              {data.awards && data.awards.length > 0 && (
                <span className="badge bg-warning text-dark ms-2 d-flex align-items-center">
                  <Award size={12} className="me-1" />
                  Travelers Choice
                </span>
              )}
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              aria-label="Fermer"
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body">
            {/* Galerie de photos principale */}
            {photos.length > 0 && (
              <div className="mb-4">
                <div className="position-relative">
                  <img 
                    src={photos[currentPhotoIndex]?.urls?.large || photos[currentPhotoIndex]?.urls?.medium || data.main_image} 
                    alt={data.name}
                    className="img-fluid rounded w-100"
                    style={{ height: '400px', objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => setShowGallery(true)}
                  />
                  
                  {photos.length > 1 && (
                    <>
                      <button 
                        className="btn btn-dark btn-sm position-absolute top-50 start-0 translate-middle-y ms-2"
                        onClick={prevPhoto}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button 
                        className="btn btn-dark btn-sm position-absolute top-50 end-0 translate-middle-y me-2"
                        onClick={nextPhoto}
                      >
                        <ChevronRight size={16} />
                      </button>
                      <div className="position-absolute bottom-0 end-0 m-3">
                        <span className="badge bg-dark">
                          {currentPhotoIndex + 1} / {photos.length}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Miniatures */}
                {photos.length > 1 && (
                  <div className="d-flex gap-2 mt-2" style={{ overflowX: 'auto' }}>
                    {photos.slice(0, 10).map((photo, index) => (
                      <img
                        key={index}
                        src={photo.urls?.thumbnail || photo.urls?.small}
                        alt={`${data.name} ${index + 1}`}
                        className={`rounded cursor-pointer ${index === currentPhotoIndex ? 'border border-primary border-3' : ''}`}
                        style={{ 
                          width: '80px', 
                          height: '60px', 
                          objectFit: 'cover',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                        onClick={() => setCurrentPhotoIndex(index)}
                      />
                    ))}
                    {photos.length > 10 && (
                      <div 
                        className="d-flex align-items-center justify-content-center rounded bg-light text-muted"
                        style={{ width: '80px', height: '60px', flexShrink: 0 }}
                      >
                        +{photos.length - 10}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Image principale si pas de photos supplémentaires */}
            {photos.length === 0 && data.main_image && (
              <div className="mb-3">
                <img 
                  src={data.main_image} 
                  alt={data.name}
                  className="img-fluid rounded w-100"
                  style={{ height: '300px', objectFit: 'cover' }}
                />
              </div>
            )}

            {/* Informations principales */}
            <div className="row mb-4">
              <div className="col-md-8">
                {/* Localisation */}
                {(data.city || data.country) && (
                  <p className="text-muted d-flex align-items-center mb-2">
                    <MapPin size={16} className="me-2" />
                    <span className="fw-medium">
                      {data.address || (data.city && data.country 
                        ? `${data.city}, ${data.country}` 
                        : (data.city || data.country))}
                    </span>
                  </p>
                )}

                {/* Rating avec détails */}
                {data.rating && (
                  <div className="d-flex align-items-center mb-3">
                    {renderStars(data.rating)}
                    {data.num_reviews && (
                      <span className="text-muted ms-2">
                        ({data.num_reviews.toLocaleString()} avis)
                      </span>
                    )}
                    {data.ranking && data.ranking > 0 && (
                      <span className="badge bg-info ms-2">
                        #{data.ranking} dans la région
                      </span>
                    )}
                  </div>
                )}

                {/* Catégories et badges */}
                <div className="mb-3">
                  {data.category && (
                    <span className="badge bg-primary me-2 mb-1">{data.category}</span>
                  )}
                  {data.subcategory && (
                    <span className="badge bg-secondary me-2 mb-1">{data.subcategory}</span>
                  )}
                  {data.distance && (
                    <span className="badge bg-success mb-1">
                      {parseFloat(data.distance).toFixed(1)} km
                      {data.bearing && ` (${data.bearing})`}
                    </span>
                  )}
                </div>

              </div>

              <div className="col-md-4">
                {/* Prix */}
                {data.price_level && (
                  <div className="mb-3">
                    <h6>Niveau de prix</h6>
                    {renderPriceLevel(data.price_level)}
                  </div>
                )}

                {/* Photos info */}
                {(data.num_photos || photos.length > 0) && (
                  <div className="mb-3">
                    <h6 className="d-flex align-items-center">
                      <Camera size={16} className="me-2" />
                      Photos disponibles
                    </h6>
                    <p className="text-muted mb-0">
                      {photos.length > 0 ? photos.length : data.num_photos} photos
                      {loadingPhotos && <span className="ms-2">Chargement...</span>}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {data.description && (
              <div className="mb-4">
                <h6 className="d-flex align-items-center">
                  <Info size={16} className="me-2" />
                  Description
                </h6>
                <p className="text-justify">{data.description}</p>
              </div>
            )}

            {/* Types de voyages populaires */}
            {data.trip_types && data.trip_types.length > 0 && (
              <div className="mb-4">
                <h6 className="d-flex align-items-center">
                  <Heart size={16} className="me-2" />
                  Populaire auprès des voyageurs
                </h6>
                <div className="row">
                  {data.trip_types.map((tripType, index) => (
                    <div key={index} className="col-md-6 col-lg-4 mb-2">
                      <div className="d-flex justify-content-between">
                        <span>{tripType.localized_name}</span>
                        <span className="text-muted">{parseInt(tripType.value).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Awards */}
            {data.awards && data.awards.length > 0 && (
              <div className="mb-4">
                <h6 className="d-flex align-items-center">
                  <Award size={16} className="me-2" />
                  Récompenses
                </h6>
                <div className="row">
                  {data.awards.map((award, index) => (
                    <div key={index} className="col-md-6 mb-2">
                      <div className="d-flex align-items-center">
                        <img 
                          src={award.images?.small} 
                          alt={award.display_name}
                          className="me-2"
                          style={{ width: '24px', height: '24px' }}
                        />
                        <div>
                          <div className="fw-medium">{award.display_name}</div>
                          <small className="text-muted">{award.year}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sous-ratings pour hôtels */}
            {data.subratings && Object.keys(data.subratings).length > 0 && (
              <div className="mb-4">
                <h6>Évaluations détaillées</h6>
                <div className="row">
                  {Object.values(data.subratings).map((rating, index) => (
                    <div key={index} className="col-md-6 mb-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <span>{rating.localized_name}</span>
                        <div className="d-flex align-items-center">
                          <span className="fw-bold me-1">{rating.value}</span>
                          <img 
                            src={rating.rating_image_url} 
                            alt={`${rating.value} étoiles`}
                            style={{ height: '20px' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Équipements */}
            {data.amenities && data.amenities.length > 0 && (
              <div className="mb-4">
                <h6>Équipements et services</h6>
                <div className="row">
                  {data.amenities.slice(0, 12).map((amenity, index) => (
                    <div key={index} className="col-md-6 col-lg-4 mb-1">
                      <span className="badge bg-light text-dark me-1">
                        {amenity}
                      </span>
                    </div>
                  ))}
                  {data.amenities.length > 12 && (
                    <div className="col-12">
                      <small className="text-muted">
                        ... et {data.amenities.length - 12} autres équipements
                      </small>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact */}
            <div className="row mb-3">
              {data.phone && (
                <div className="col-md-6">
                  <h6 className="d-flex align-items-center">
                    <Phone size={16} className="me-2" />
                    Contact
                  </h6>
                  <a href={`tel:${data.phone}`} className="text-decoration-none">
                    {data.phone}
                  </a>
                </div>
              )}
              {data.timezone && (
                <div className="col-md-6">
                  <h6 className="d-flex align-items-center">
                    <Clock size={16} className="me-2" />
                    Fuseau horaire
                  </h6>
                  <span>{data.timezone}</span>
                </div>
              )}
            </div>
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
            {photos.length > 0 && (
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => setShowGallery(true)}
              >
                <Camera size={16} className="me-1" />
                Voir toutes les photos ({photos.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal galerie plein écran */}
      {showGallery && photos.length > 0 && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 1060 }}>
          <div className="modal-dialog modal-fullscreen">
            <div className="modal-content bg-dark">
              <div className="modal-header border-0">
                <h5 className="modal-title text-white">
                  Galerie - {data.name} ({currentPhotoIndex + 1}/{photos.length})
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowGallery(false)}
                ></button>
              </div>
              <div className="modal-body d-flex align-items-center justify-content-center p-0">
                <div className="position-relative w-100 h-100 d-flex align-items-center justify-content-center">
                  <img 
                    src={photos[currentPhotoIndex]?.urls?.original || photos[currentPhotoIndex]?.urls?.large} 
                    alt={`${data.name} ${currentPhotoIndex + 1}`}
                    className="img-fluid"
                    style={{ maxHeight: '90vh', maxWidth: '90vw' }}
                  />
                  
                  {photos.length > 1 && (
                    <>
                      <button 
                        className="btn btn-light position-absolute top-50 start-0 translate-middle-y ms-3"
                        onClick={prevPhoto}
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button 
                        className="btn btn-light position-absolute top-50 end-0 translate-middle-y me-3"
                        onClick={nextPhoto}
                      >
                        <ChevronRight size={24} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttractionModal;