import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, ListGroup, Alert, Carousel } from 'react-bootstrap';
import { Star, MapPin, Phone, Globe, Clock, DollarSign, Heart, ArrowLeft, Camera, Award, MessageSquare } from 'lucide-react';
import { attractionsAPI, compilationAPI } from '../services/api';
import ReviewCard from '../components/ReviewCard';

const AttractionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attraction, setAttraction] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCompilation, setAddingToCompilation] = useState(false);
  const [isInCompilation, setIsInCompilation] = useState(false);

  useEffect(() => {
    loadAttraction();
    checkIfInCompilation();
  }, [id]);

  const checkIfInCompilation = async () => {
    try {
      const inComp = await compilationAPI.isInCompilation(parseInt(id));
      setIsInCompilation(inComp);
    } catch (err) {
      console.error('Erreur vérification compilation:', err);
    }
  };

  const loadPhotosForAttraction = async (tripadvisorId) => {
    try {
      const url = `http://127.0.0.1:8000/api/${tripadvisorId}/photos/`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPhotos(data.photos || []);
      }
    } catch (err) {
      console.error('Erreur chargement photos:', err);
    }
  };

  const loadReviewsForAttraction = async (tripadvisorId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/${tripadvisorId}/reviews/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Erreur chargement reviews:', err);
    }
  };

  const loadAttraction = async () => {
    try {
      setLoading(true);
      const data = await attractionsAPI.getAttractionById(id);
      setAttraction(data);
      // Charger les photos et reviews après avoir récupéré l'attraction
      if (data.tripadvisor_id) {
        await Promise.all([
          loadPhotosForAttraction(data.tripadvisor_id),
          loadReviewsForAttraction(data.tripadvisor_id)
        ]);
      }
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
      setIsInCompilation(true);
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
    if (!url) return 'https://via.placeholder.com/800x400?text=Pas+d\'image';
    // Les images TripAdvisor sont publiques et accessibles directement
    return url;
  };

  // Préparer les photos pour l'affichage (max 5 photos additionnelles)
  const displayPhotos = photos.slice(0, 5).map(photo => ({
    url: photo.urls?.large || photo.urls?.medium || photo.urls?.original,
    caption: photo.caption || '',
  }));

  return (
    <Container className="py-4">
      <Button variant="link" onClick={() => navigate(-1)} className="mb-3">
        <ArrowLeft className="me-2" size={20} />
        Retour
      </Button>

      <Row>
        <Col lg={8}>
          {/* Carrousel d'images principal + photos additionnelles */}
          <Card className="mb-4">
            {displayPhotos.length > 0 ? (
              <Carousel>
                {/* Image principale d'abord */}
                <Carousel.Item>
                  <img
                    className="d-block w-100"
                    src={getImageUrl(attraction.main_image)}
                    alt={attraction.name}
                    style={{ height: '400px', objectFit: 'cover' }}
                  />
                  <Carousel.Caption>
                    <h5>Photo principale</h5>
                  </Carousel.Caption>
                </Carousel.Item>
                
                {/* Photos additionnelles */}
                {displayPhotos.map((photo, index) => (
                  <Carousel.Item key={index}>
                    <img
                      className="d-block w-100"
                      src={getImageUrl(photo.url)}
                      alt={photo.caption || `Photo ${index + 1}`}
                      style={{ height: '400px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/800x400?text=Image+non+disponible';
                      }}
                    />
                    {photo.caption && (
                      <Carousel.Caption>
                        <p>{photo.caption}</p>
                      </Carousel.Caption>
                    )}
                  </Carousel.Item>
                ))}
              </Carousel>
            ) : (
              <Card.Img 
                variant="top" 
                src={getImageUrl(attraction.main_image)} 
                style={{ height: '400px', objectFit: 'cover' }}
              />
            )}
            
            {/* Indicateur nombre de photos */}
            {(attraction.num_photos || photos.length > 0) && (
              <Card.Footer className="text-muted">
                <Camera className="me-2" size={16} />
                {attraction.num_photos || photos.length} photo(s) disponible(s)
                {photos.length > 5 && ` - Affichage de 5 sur ${photos.length}`}
              </Card.Footer>
            )}
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
                  variant={isInCompilation ? "success" : "primary"}
                  onClick={handleAddToCompilation}
                  disabled={addingToCompilation || isInCompilation}
                >
                  <Heart className="me-2" size={20} fill={isInCompilation ? "currentColor" : "none"} />
                  {isInCompilation ? 'Ajouté ✓' : addingToCompilation ? 'Ajout...' : 'Ajouter à ma compilation'}
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
              
              {/* Détails supplémentaires */}
              {attraction.ranking && attraction.ranking > 0 && (
                <div className="alert alert-info d-flex align-items-center">
                  <Award className="me-2" size={20} />
                  <strong>Classement #{attraction.ranking}</strong> à {attraction.city}
                </div>
              )}
              
              {/* Styles et types de voyage */}
              {attraction.styles && attraction.styles.length > 0 && (
                <div className="mb-3">
                  <h6>Styles :</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {attraction.styles.map((style, index) => (
                      <Badge key={index} bg="light" text="dark">{style}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {attraction.trip_types && attraction.trip_types.length > 0 && (
                <div className="mb-3">
                  <h6>Types de voyage populaires :</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {attraction.trip_types.map((type, index) => (
                      <Badge key={index} bg="secondary">
                        {type.localized_name || type.name} {type.value && `(${type.value})`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Équipements */}
              {attraction.amenities && attraction.amenities.length > 0 && (
                <div className="mb-3">
                  <h6>Équipements :</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {attraction.amenities.map((amenity, index) => (
                      <Badge key={index} bg="success">{amenity}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Sous-évaluations (si disponibles) */}
          {attraction.subratings && Object.keys(attraction.subratings).length > 0 && (
            <Card className="mb-4">
              <Card.Header>
                <h5>Évaluations détaillées</h5>
              </Card.Header>
              <Card.Body>
                {Object.entries(attraction.subratings).map(([key, value]) => (
                  <div key={key} className="mb-2">
                    <div className="d-flex justify-content-between">
                      <span className="text-capitalize">{key.replace(/_/g, ' ')} :</span>
                      <strong>{value} / 5</strong>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div 
                        className="progress-bar bg-warning" 
                        role="progressbar" 
                        style={{ width: `${(value / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </Card.Body>
            </Card>
          )}

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

      {/* Section Reviews */}
      {reviews.length > 0 && (
        <Row className="mt-4">
          <Col lg={12}>
            <Card className="mb-4">
              <Card.Header>
                <h4 className="mb-0">
                  <MessageSquare size={24} className="me-2" />
                  Avis des voyageurs ({reviews.length})
                </h4>
              </Card.Header>
              <Card.Body>
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default AttractionDetailPage;