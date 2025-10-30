import React from 'react';
import { Star, MapPin, DollarSign, Camera, MessageCircle } from 'lucide-react';

const AttractionCard = ({ 
  attraction, 
  onClick, 
  showDetails = true,
  className = "" 
}) => {
  const {
    name,
    city,
    country,
    category,
    rating,
    num_reviews,
    price_level,
    main_image
  } = attraction;

  // Fonction pour afficher les étoiles
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} size={14} className="text-warning" fill="currentColor" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" size={14} className="text-warning" fill="currentColor" style={{clipPath: 'inset(0 50% 0 0)'}} />
      );
    }

    // Ajouter les étoiles vides
    const remainingStars = 5 - Math.ceil(rating || 0);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} size={14} className="text-muted" />
      );
    }

    return stars;
  };

  // Fonction pour gérer le clic
  const handleClick = () => {
    if (onClick) {
      onClick(attraction);
    }
  };

  return (
    <div className={`card h-100 shadow-sm attraction-card ${className}`} style={{cursor: 'pointer'}}>
      {/* Image de l'attraction */}
      <div className="position-relative">
        {main_image ? (
          <img 
            src={main_image} 
            alt={name}
            className="card-img-top"
            style={{height: '200px', objectFit: 'cover'}}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
            }}
          />
        ) : (
          <div className="card-img-top d-flex flex-column align-items-center justify-content-center bg-light text-muted" style={{height: '200px'}}>
            <Camera size={48} />
            <small className="mt-2">Pas d'image</small>
          </div>
        )}
        
        {/* Badge catégorie */}
        <div className="position-absolute top-0 end-0 m-2">
          <span className="badge bg-primary">
            {category}
          </span>
        </div>
      </div>

      {/* Contenu de la carte */}
      <div 
        className="card-body d-flex flex-column"
        onClick={handleClick}
        role="button"
        tabIndex={0}
      >
        {/* Titre et localisation */}
        <div className="mb-2">
          <h5 className="card-title text-truncate mb-1" title={name}>
            {name}
          </h5>
          <div className="text-muted small d-flex align-items-center">
            <MapPin size={14} className="me-1" />
            <span className="text-truncate">{city}, {country}</span>
          </div>
        </div>

        {showDetails && (
          <div className="mt-auto">
            {/* Rating et reviews */}
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="d-flex align-items-center">
                <div className="me-2 d-flex">
                  {renderStars(rating)}
                </div>
                <small className="text-muted">
                  {rating ? rating.toFixed(1) : 'N/A'}
                </small>
              </div>
              {num_reviews > 0 && (
                <div className="d-flex align-items-center text-muted small">
                  <MessageCircle size={14} className="me-1" />
                  <span>{num_reviews} avis</span>
                </div>
              )}
            </div>

            {/* Prix */}
            {price_level && (
              <div className="d-flex align-items-center text-success">
                <DollarSign size={14} className="me-1" />
                <small className="fw-bold">{price_level}</small>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttractionCard;