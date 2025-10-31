import React from 'react';
import { Star, MapPin, Users, Camera, ExternalLink, Award, Heart, Calendar } from 'lucide-react';

const AttractionCard = ({ attraction, onViewDetails, showDistance = false }) => {
  const {
    name,
    description,
    city,
    country,
    rating,
    num_reviews,
    main_image,
    num_photos,
    category,
    subcategory,
    price_level,
    distance,
    bearing,
    awards,
    trip_types,
    ranking
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
    
    // Gérer les prix avec des €
    if (typeof price_level === 'string' && price_level.includes('€')) {
      const count = price_level.length;
      const levels = {
        1: { text: 'Économique', color: 'success' },
        2: { text: 'Modéré', color: 'warning' },
        3: { text: 'Cher', color: 'danger' },
        4: { text: 'Très cher', color: 'danger' }
      };
      const level = levels[count] || { text: price_level, color: 'secondary' };
      return (
        <span className={`badge bg-${level.color} ms-2`}>
          {price_level} {level.text}
        </span>
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
      <span className={`badge bg-${level.color} ms-2`}>
        {'€'.repeat(price_level)} {level.text}
      </span>
    );
  };

  // Fonction pour afficher les awards
  const renderAward = () => {
    if (!awards || awards.length === 0) return null;
    
    const latestAward = awards[0]; // Premier award (plus récent)
    if (latestAward.award_type && latestAward.award_type.includes('Travelers Choice')) {
      return (
        <div className="position-absolute top-0 end-0 m-2">
          <span className="badge bg-warning text-dark d-flex align-items-center">
            <Award size={12} className="me-1" />
            Travelers Choice {latestAward.year}
          </span>
        </div>
      );
    }
    return null;
  };

  // Fonction pour afficher le type de voyage le plus populaire
  const renderPopularTripType = () => {
    if (!trip_types || trip_types.length === 0) return null;
    
    // Trouver le type avec le plus de votes
    const mostPopular = trip_types.reduce((max, current) => {
      const currentValue = parseInt(current.value) || 0;
      const maxValue = parseInt(max.value) || 0;
      return currentValue > maxValue ? current : max;
    });
    
    if (mostPopular && mostPopular.localized_name) {
      return (
        <small className="text-muted d-flex align-items-center me-2">
          <Heart size={12} className="me-1" />
          Populaire: {mostPopular.localized_name}
        </small>
      );
    }
    return null;
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
          
          {/* Badge catégorie et sous-catégorie */}
          <div className="position-absolute top-0 start-0 m-2">
            {category && (
              <span className="badge bg-primary mb-1 d-block">
                {category}
              </span>
            )}
            {subcategory && (
              <span className="badge bg-secondary d-block">
                {subcategory}
              </span>
            )}
          </div>
          
          {/* Award badge */}
          {renderAward()}
          
          {/* Badge distance (si recherche géolocalisée) */}
          {showDistance && distance && (
            <span className="badge bg-success position-absolute bottom-0 end-0 m-2">
              {parseFloat(distance).toFixed(1)} km {bearing && `(${bearing})`}
            </span>
          )}
          
          {/* Badge ranking */}
          {ranking && ranking > 0 && (
            <span className="badge bg-info position-absolute bottom-0 start-0 m-2">
              #{ranking}
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
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex flex-wrap">
                {num_photos && num_photos > 1 && (
                  <small className="text-muted d-flex align-items-center me-2">
                    <Camera size={14} className="me-1" />
                    {num_photos.toLocaleString()} photos
                  </small>
                )}
                {renderPopularTripType()}
              </div>
            </div>
            
            <button
              className="btn btn-primary btn-sm w-100"
              onClick={() => onViewDetails(attraction)}
            >
              <ExternalLink size={16} className="me-1" />
              Voir détails
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttractionCard;
