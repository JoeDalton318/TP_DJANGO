import React from 'react';
import { Star, MapPin, Users, Camera, ExternalLink } from 'lucide-react';

const AttractionCard = ({ attraction, onViewDetails, showDistance = false }) => {
  const {
    id,
    name,
    description,
    city,
    country,
    rating,
    num_reviews,
    main_image,
    num_photos,
    category,
    price_level,
    distance,
    bearing
  } = attraction;

  // Fonction pour afficher les étoiles
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
        {num_reviews && (
          <span className="text-muted">({num_reviews.toLocaleString()} avis)</span>
        )}
      </div>
    );
  };

  // Fonction pour afficher le niveau de prix
  const renderPriceLevel = (price_level) => {
    if (!price_level) return null;
    
    const levels = {
      1: { text: 'Économique', color: 'success' },
      2: { text: 'Modéré', color: 'warning' },
      3: { text: 'Cher', color: 'danger' },
      4: { text: 'Très cher', color: 'danger' }
    };
    
    const level = levels[price_level];
    if (!level) return null;
    
    return (
      <span className={`badge bg-${level.color} ms-2`}>
        {level.text}
      </span>
    );
  };

  // Image par défaut si pas d'image disponible
  const imageUrl = main_image;
  const defaultImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiBmb250LXNpemU9IjE4IiBmaWxsPSIjNmM3NTdkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UGFzIGQnaW1hZ2UgZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4=";

  return (
    <div className="col">
      <div className="card h-100 attraction-card shadow-sm">
        {/* Image */}
        <div className="position-relative">
          <img
            src={imageUrl || defaultImage}
            className="card-img-top"
            alt={name}
            style={{ height: '200px', objectFit: 'cover' }}
            onError={(e) => {
              e.target.src = defaultImage;
            }}
          />
          
          {/* Badge catégorie */}
          {category && (
            <span className="badge bg-primary position-absolute top-0 start-0 m-2">
              {category}
            </span>
          )}
          
          {/* Badge distance (si recherche géolocalisée) */}
          {showDistance && distance && (
            <span className="badge bg-success position-absolute top-0 end-0 m-2">
              {parseFloat(distance).toFixed(1)} km {bearing && `(${bearing})`}
            </span>
          )}
        </div>

        <div className="card-body d-flex flex-column">
          {/* Titre */}
          <h5 className="card-title">{name}</h5>
          
          {/* Localisation */}
          <p className="card-text text-muted d-flex align-items-center mb-2">
            <MapPin size={16} className="me-1" />
            {city && country ? `${city}, ${country}` : (city || country || 'Localisation inconnue')}
          </p>
          
          {/* Rating */}
          {rating && (
            <div className="mb-2">
              {renderStars(rating)}
            </div>
          )}
          
          {/* Prix */}
          {price_level && (
            <div className="mb-2">
              {renderPriceLevel(price_level)}
            </div>
          )}
          
          {/* Description */}
          {description && (
            <p className="card-text flex-grow-1">
              {description.length > 120 
                ? `${description.substring(0, 120)}...` 
                : description
              }
            </p>
          )}
          
          {/* Actions */}
          <div className="mt-auto pt-2">
            <div className="d-flex justify-content-between align-items-center">
              {num_photos && num_photos > 1 && (
                <small className="text-muted d-flex align-items-center">
                  <Camera size={14} className="me-1" />
                  {num_photos} photos
                </small>
              )}
              
              <button
                className="btn btn-primary btn-sm"
                onClick={() => onViewDetails(attraction)}
              >
                <ExternalLink size={16} className="me-1" />
                Voir détails
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttractionCard;