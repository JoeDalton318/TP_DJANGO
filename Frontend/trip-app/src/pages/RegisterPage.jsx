import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { UserPlus, User, Globe, Briefcase } from 'lucide-react';
import { authAPI } from '../services/api';

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    profile_type: location.state?.profile_type || 'tourist',
    selected_country: location.state?.selected_country || 'France',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const profileOptions = [
    { value: 'local', label: 'Local', icon: User },
    { value: 'tourist', label: 'Touriste', icon: Globe },
    { value: 'professional', label: 'Professionnel', icon: Briefcase },
  ];

  const countries = [
    'France', 'Espagne', 'Italie', 'Royaume-Uni', 'Allemagne',
    'États-Unis', 'Canada', 'Japon', 'Australie', 'Brésil'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setLoading(true);

    try {
      const registerData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        profile_type: formData.profile_type,
        selected_country: formData.selected_country,
      };

      const response = await authAPI.register(registerData);
      
      // Stocker les tokens
      if (response.tokens) {
        localStorage.setItem('accessToken', response.tokens.access);
        localStorage.setItem('refreshToken', response.tokens.refresh);
      }

      // Rediriger vers la page d'accueil
      navigate('/home', { replace: true });
    } catch (err) {
      const errorMessage = err.response?.data?.username?.[0] 
        || err.response?.data?.email?.[0]
        || err.response?.data?.detail
        || 'Erreur lors de l\'inscription';
      setError(errorMessage);
      console.error('Erreur d\'inscription:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <Row className="w-100">
        <Col md={8} lg={6} className="mx-auto">
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <UserPlus size={48} className="text-primary mb-3" />
                <h2 className="mb-2">Inscription</h2>
                <p className="text-muted">Créez votre compte Trip Explorer</p>
              </div>

              {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nom d'utilisateur *</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        placeholder="Choisissez un nom d'utilisateur"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email *</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="votre@email.com"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Mot de passe *</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={8}
                        placeholder="Min. 8 caractères"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirmer le mot de passe *</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder="Répétez le mot de passe"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Type de profil *</Form.Label>
                  <div className="d-flex gap-2">
                    {profileOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant={formData.profile_type === option.value ? 'primary' : 'outline-primary'}
                        onClick={() => setFormData({ ...formData, profile_type: option.value })}
                        className="flex-fill"
                      >
                        <option.icon size={20} className="me-2" />
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Pays de destination *</Form.Label>
                  <Form.Select
                    name="selected_country"
                    value={formData.selected_country}
                    onChange={handleChange}
                    required
                  >
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mb-3"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? 'Inscription...' : 'S\'inscrire'}
                </Button>

                <div className="text-center">
                  <p className="text-muted mb-0">
                    Déjà un compte ?{' '}
                    <Link to="/login" className="text-primary">
                      Se connecter
                    </Link>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;
