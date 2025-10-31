import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { Globe, User, Briefcase, MapPin } from 'lucide-react';
import { authAPI } from '../services/api';

const LandingPage = () => {
  const navigate = useNavigate();
  const [profileType, setProfileType] = useState('tourist');
  const [selectedCountry, setSelectedCountry] = useState('France');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const profileOptions = [
    { value: 'local', label: 'Local', icon: User, description: 'Découvrez votre ville autrement' },
    { value: 'tourist', label: 'Touriste', icon: Globe, description: 'Explorez de nouvelles destinations' },
    { value: 'professional', label: 'Professionnel', icon: Briefcase, description: 'Planifiez vos déplacements pros' }
  ];

  const countries = [
    'France', 'Espagne', 'Italie', 'Royaume-Uni', 'Allemagne', 
    'États-Unis', 'Canada', 'Japon', 'Australie', 'Brésil'
  ];

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        // Utilisateur connecté : mettre à jour le profil
        await authAPI.updateProfile({ profile_type: profileType, selected_country: selectedCountry });
        navigate('/home');
      } else {
        // Utilisateur non connecté : rediriger vers la page d'inscription
        navigate('/register', { 
          state: { 
            profile_type: profileType, 
            selected_country: selectedCountry 
          } 
        });
      }
    } catch (err) {
      setError('Erreur lors de la sélection du profil');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-gradient">
      <Row className="w-100">
        <Col lg={8} className="mx-auto">
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5">
              <div className="text-center mb-5">
                <h1 className="display-4 mb-3">🌍 Trip Explorer</h1>
                <p className="lead text-muted">Découvrez les meilleures attractions avec TripAdvisor</p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {/* Sélection du profil */}
              <div className="mb-5">
                <h4 className="mb-4 d-flex align-items-center">
                  <User className="me-2" size={24} />
                  Choisissez votre profil
                </h4>
                <Row>
                  {profileOptions.map(option => (
                    <Col md={4} key={option.value} className="mb-3">
                      <Card 
                        className={`h-100 cursor-pointer ${profileType === option.value ? 'border-primary border-3' : ''}`}
                        onClick={() => setProfileType(option.value)}
                        style={{ cursor: 'pointer' }}
                      >
                        <Card.Body className="text-center">
                          <option.icon size={48} className="mb-3 text-primary" />
                          <h5>{option.label}</h5>
                          <p className="text-muted small">{option.description}</p>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>

              {/* Sélection du pays */}
              <div className="mb-4">
                <h4 className="mb-3 d-flex align-items-center">
                  <MapPin className="me-2" size={24} />
                  Sélectionnez un pays
                </h4>
                <Form.Select 
                  size="lg" 
                  value={selectedCountry} 
                  onChange={(e) => setSelectedCountry(e.target.value)}
                >
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </Form.Select>
              </div>

              {/* Bouton de démarrage */}
              <div className="text-center">
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={handleStart}
                  disabled={loading}
                  className="px-5"
                >
                  {loading ? 'Chargement...' : 'Commencer l\'exploration'}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LandingPage;
