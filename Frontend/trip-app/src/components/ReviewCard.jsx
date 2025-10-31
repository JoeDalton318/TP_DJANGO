import React from 'react';
import PropTypes from 'prop-types';

const ReviewCard = ({ review }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getRatingStars = (rating) => {
    return '⭐'.repeat(rating);
  };

  const getTripTypeLabel = (tripType) => {
    const labels = {
      'Family': 'En famille',
      'Couples': 'En couple',
      'Solo': 'Solo',
      'Business': 'Professionnel',
      'Friends getaway': 'Entre amis'
    };
    return labels[tripType] || tripType;
  };

  return (
    <div className="card mb-3 shadow-sm">
      <div className="card-body">
        {/* Header avec user et rating */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex align-items-center">
            <img 
              src={review.user?.avatar?.thumbnail || 'https://placehold.co/50x50/e0e0e0/666666?text=User'} 
              alt={review.user?.username || 'User'}
              className="rounded-circle me-3"
              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
              onError={(e) => {
                e.target.src = 'https://placehold.co/50x50/e0e0e0/666666?text=User';
              }}
            />
            <div>
              <h6 className="mb-0 fw-bold">{review.user?.username || 'Anonyme'}</h6>
              {review.user?.user_location?.name && (
                <small className="text-muted">
                  📍 {review.user.user_location.name}
                </small>
              )}
            </div>
          </div>
          <div className="text-end">
            <div className="fs-5 mb-1">{getRatingStars(review.rating)}</div>
            <small className="text-muted">
              {formatDate(review.published_date)}
            </small>
          </div>
        </div>

        {/* Titre de la review */}
        {review.title && (
          <h5 className="card-title mb-3">{review.title}</h5>
        )}

        {/* Texte de la review */}
        <p className="card-text">{review.text}</p>

        {/* Footer avec trip type et date de voyage */}
        <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
          {review.trip_type && (
            <span className="badge bg-secondary">
              {getTripTypeLabel(review.trip_type)}
            </span>
          )}
          {review.travel_date && (
            <small className="text-muted">
              Date du voyage : {formatDate(review.travel_date)}
            </small>
          )}
        </div>

        {/* Subratings (optionnel) */}
        {review.subratings && Object.keys(review.subratings).length > 0 && (
          <div className="mt-3 pt-3 border-top">
            <small className="text-muted d-block mb-2">Détails des notes :</small>
            <div className="row g-2">
              {Object.values(review.subratings).map((subrating, idx) => (
                <div key={idx} className="col-6 col-md-4">
                  <small className="text-muted">
                    {subrating.localized_name}: {getRatingStars(subrating.value)}
                  </small>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Helpful votes */}
        {review.helpful_votes > 0 && (
          <div className="mt-2">
            <small className="text-muted">
              👍 {review.helpful_votes} personne{review.helpful_votes > 1 ? 's' : ''} ont trouvé cet avis utile
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

ReviewCard.propTypes = {
  review: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string,
    text: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired,
    published_date: PropTypes.string.isRequired,
    travel_date: PropTypes.string,
    trip_type: PropTypes.string,
    helpful_votes: PropTypes.number,
    user: PropTypes.shape({
      username: PropTypes.string,
      user_location: PropTypes.shape({
        name: PropTypes.string
      }),
      avatar: PropTypes.shape({
        thumbnail: PropTypes.string
      })
    }),
    subratings: PropTypes.object
  }).isRequired
};

export default ReviewCard;
