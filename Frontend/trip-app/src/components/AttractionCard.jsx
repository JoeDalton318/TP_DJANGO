import { Card } from 'react-bootstrap';

export default function AttractionCard({ attraction }) {
  return (
    <Card className="h-100 shadow-sm">
      {attraction.main_image && (
        <Card.Img 
          variant="top" 
          src={attraction.main_image} 
          style={{ height: '200px', objectFit: 'cover' }}
          alt={attraction.name}
        />
      )}
      <Card.Body className="d-flex flex-column">
        <Card.Title className="text-truncate" title={attraction.name}>
          {attraction.name}
        </Card.Title>
        <Card.Text className="text-muted small">
          📍 {attraction.city}, {attraction.country}
        </Card.Text>
        {attraction.rating && (
          <Card.Text className="mb-2">
            ⭐ {attraction.rating}/5 ({attraction.num_reviews} avis)
          </Card.Text>
        )}
        {attraction.category && (
          <Card.Text className="small">
            🏷️ {attraction.category}
          </Card.Text>
        )}
      </Card.Body>
    </Card>
  );
}