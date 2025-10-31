import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, ListGroup, Alert } from 'react-bootstrap';
import { Star, MapPin, Phone, Globe, Clock, DollarSign, Heart, ArrowLeft } from 'lucide-react';
import { attractionsAPI, compilationAPI } from '../services/api';

const AttractionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attraction, setAttraction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCompilation, setAddingToCompilation] = useState(false);

  useEffect(() => {
    loadAttraction();
  }, [id]);

  const loadAttraction = async () => {
    try {
      setLoading(true);
      const data = await attractionsAPI.getAttractionById(id);
      setAttraction(data);
    } catch (err) {
      setError('Impossible de charger les détails de l\'attraction');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCompilation = async () => {
    try {
      setAddingToCompilation(true);
      await compilationAPI.addAttraction(attraction.id);
      alert(`${attraction.name} ajouté à votre compilation !`);
    } catch (err) {
      alert('Erreur lors de l\'ajout à la compilation');
    } finally {
      setAddingToCompilation(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </Container>
    );
  }

  if (error || !attraction) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || 'Attraction non trouvée'}</Alert>
        <Button variant="primary" onClick={() => navigate(-1)}>
          <ArrowLeft className="me-2" size={20} />
          Retour
        </Button>
      </Container>
    );
  }

  const getImageUrl = (url) => {
    if (url && url.includes('tripadvisor.com')) {
      return `/api/attractions/proxy-image/?url=${encodeURIComponent(url)}`;
    }
    return url || 'https://via.placeholder.com/800x400?text=Pas+d\'image';
  };

  return (
    <Container className="py-4">
      <Button variant="link" onClick={() => navigate(-1)} className="mb-3">
        <ArrowLeft className="me-2" size={20} />
        Retour
      </Button>

      <Row>
        <Col lg={8}>
          {/* Image principale */}
          <Card className="mb-4">
            <Card.Img 
              variant="top" 
              src={getImageUrl(attraction.main_image)} 
              style={{ height: '400px', objectFit: 'cover' }}
            />
          </Card>

          {/* Informations principales */}
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h1 className="mb-2">{attraction.name}</h1>
                  <Badge bg="secondary" className="me-2">{attraction.category}</Badge>
                  {attraction.subcategory && (
                    <Badge bg="light" text="dark">{attraction.subcategory}</Badge>
                  )}
                </div>
                <Button 
                  variant="primary" 
                  onClick={handleAddToCompilation}
                  disabled={addingToCompilation}
                >
                  <Heart className="me-2" size={20} />
                  {addingToCompilation ? 'Ajout...' : 'Ajouter à ma compilation'}
                </Button>
              </div>

              <div className="d-flex gap-3 mb-3">
                <Badge bg="warning" className="d-flex align-items-center gap-1">
                  <Star size={16} fill="currentColor" />
                  {attraction.rating || 'N/A'} / 5
                </Badge>
                <Badge bg="info">
                  {attraction.num_reviews || 0} avis
                </Badge>
                {attraction.price_level && (
                  <Badge bg="success" className="d-flex align-items-center gap-1">
                    <DollarSign size={16} />
                    {attraction.price_level}
                  </Badge>
                )}
              </div>

              <p className="lead">{attraction.description}</p>
            </Card.Body>
          </Card>

          {/* Informations spécifiques */}
          {attraction.category === 'restaurant' && attraction.cuisine_type && (
            <Card className="mb-4">
              <Card.Header>
                <h5>Type de cuisine</h5>
              </Card.Header>
              <Card.Body>
                <p>{attraction.cuisine_type}</p>
              </Card.Body>
            </Card>
          )}

          {attraction.category === 'hotel' && attraction.hotel_style && (
            <Card className="mb-4">
              <Card.Header>
                <h5>Style d'hôtel</h5>
              </Card.Header>
              <Card.Body>
                <p>{attraction.hotel_style}</p>
              </Card.Body>
            </Card>
          )}

          {attraction.category === 'attraction' && attraction.attraction_groups && (
            <Card className="mb-4">
              <Card.Header>
                <h5>Groupes d'attractions</h5>
              </Card.Header>
              <Card.Body>
                <p>{attraction.attraction_groups}</p>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col lg={4}>
          {/* Coordonnées */}
          <Card className="mb-4">
            <Card.Header>
              <h5>Coordonnées</h5>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <MapPin size={18} className="me-2" />
                {attraction.address}<br />
                {attraction.city}, {attraction.country}
              </ListGroup.Item>
              {attraction.phone && (
                <ListGroup.Item>
                  <Phone size={18} className="me-2" />
                  <a href={`tel:${attraction.phone}`}>{attraction.phone}</a>
                </ListGroup.Item>
              )}
              {attraction.website && (
                <ListGroup.Item>
                  <Globe size={18} className="me-2" />
                  <a href={attraction.website} target="_blank" rel="noopener noreferrer">
                    Site web
                  </a>
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>

          {/* Horaires */}
          {attraction.opening_hours && Object.keys(attraction.opening_hours).length > 0 && (
            <Card className="mb-4">
              <Card.Header>
                <h5><Clock size={18} className="me-2" />Horaires</h5>
              </Card.Header>
              <ListGroup variant="flush">
                {Object.entries(attraction.opening_hours).map(([day, hours]) => (
                  <ListGroup.Item key={day}>
                    <strong>{day}:</strong> {hours}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          )}

          {/* Récompenses */}
          {attraction.awards && attraction.awards.length > 0 && (
            <Card className="mb-4">
              <Card.Header>
                <h5>🏆 Récompenses</h5>
              </Card.Header>
              <ListGroup variant="flush">
                {attraction.awards.map((award, index) => (
                  <ListGroup.Item key={index}>
                    {typeof award === 'string' ? award : award.display_name}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default AttractionDetailPage;