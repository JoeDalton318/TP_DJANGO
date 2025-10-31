import React from 'react';
import AttractionCard from '../src/components/AttractionCard';

// Test pour vérifier le problème de double image
const TestImageLoading = () => {
  const testAttraction = {
    id: 'test-1',
    name: 'Test Attraction Berlin',
    city: 'Berlin',
    country: 'Germany',
    category: 'attraction',
    rating: 4.5,
    num_reviews: 150,
    price_level: '$$',
    main_image: 'https://media-cdn.tripadvisor.com/media/photo-m/1b/4e/5d/82/berlin-hauptbahnhof.jpg'
  };

  const testAttractionNoImage = {
    id: 'test-2',
    name: 'Test Sans Image',
    city: 'Paris',
    country: 'France',
    category: 'restaurant',
    rating: 4.2,
    num_reviews: 89,
    price_level: '$$$',
    main_image: null
  };

  const testAttractionBadImage = {
    id: 'test-3',
    name: 'Test Image Cassée',
    city: 'Tokyo',
    country: 'Japan',
    category: 'hotel',
    rating: 4.8,
    num_reviews: 234,
    price_level: '$$$$',
    main_image: 'https://invalid-url.com/broken-image.jpg'
  };

  console.log('🧪 Test composant AttractionCard:');
  console.log('1. Attraction avec image valide');
  console.log('2. Attraction sans image');
  console.log('3. Attraction avec image cassée');

  return (
    <div className="container mt-4">
      <h2>Test Image Loading - AttractionCard</h2>
      <div className="row">
        <div className="col-md-4 mb-3">
          <h5>Avec Image</h5>
          <AttractionCard attraction={testAttraction} />
        </div>
        <div className="col-md-4 mb-3">
          <h5>Sans Image</h5>
          <AttractionCard attraction={testAttractionNoImage} />
        </div>
        <div className="col-md-4 mb-3">
          <h5>Image Cassée</h5>
          <AttractionCard attraction={testAttractionBadImage} />
        </div>
      </div>
    </div>
  );
};

export default TestImageLoading;