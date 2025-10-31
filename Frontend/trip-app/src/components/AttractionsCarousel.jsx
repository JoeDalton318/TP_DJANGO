import React from 'react';
import { Carousel, Card, Badge } from 'react-bootstrap';
import { Star, MapPin, Heart } from 'lucide-react';

const AttractionsCarousel = ({ attractions, onAttractionClick }) => {
  if (!attractions || attractions.length === 0) {
    return null;
  }

  const getImageUrl = (attraction) => {
    if (attraction.main_image) {
      return attraction.main_image.includes('tripadvisor.com')
        ? `/api/attractions/proxy-image/?url=${encodeURIComponent(attraction.main_image)}`
        : attraction.main_image;
    }
    return 'https://via.placeholder.com/800x400?text=Pas+d\'image';
  };

  return (
    <Carousel className="mb-4" interval={5000}>
      {attractions.map((attraction, index) => (
        <Carousel.Item key={attraction.id || index}>
          <div 
            style={{ height: '400px', overflow: 'hidden', cursor: 'pointer' }}
            onClick={() => onAttractionClick(attraction)}
          >
            <img
              className="d-block w-100"
              src={getImageUrl(attraction)}
              alt={attraction.name}
              style={{ objectFit: 'cover', height: '100%' }}
            />
            <Carousel.Caption style={{ background: 'rgba(0,0,0,0.6)', borderRadius: '10px', padding: '20px' }}>
              <h3>{attraction.name}</h3>
              <div className="d-flex justify-content-center align-items-center gap-3 mt-2">
                <Badge bg="warning" className="d-flex align-items-center gap-1">
                  <Star size={16} fill="currentColor" />
                  {attraction.rating || 'N/A'} / 5
                </Badge>
                <Badge bg="info" className="d-flex align-items-center gap-1">
                  <Heart size={16} />
                  {attraction.num_reviews || 0} avis
                </Badge>
                <Badge bg="secondary" className="d-flex align-items-center gap-1">
                  <MapPin size={16} />
                  {attraction.city}, {attraction.country}
                </Badge>
              </div>
              <p className="mt-2 mb-0">{attraction.description?.substring(0, 100)}...</p>
            </Carousel.Caption>
          </div>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default AttractionsCarousel;