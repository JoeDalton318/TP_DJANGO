import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge } from 'react-bootstrap';
import { User, Mail, Lock, Save, Shield, Award, LogOut } from 'lucide-react';
import { authAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // États pour les formulaires
  const [userInfo, setUserInfo] = useState({
    username: '',
    email: '',
  });

  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [profileSettings, setProfileSettings] = useState({
    profile_type: '',
    selected_country: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await authAPI.getProfile();
      setProfile(data);
      setUserInfo({
        username: data.username,
        email: data.email,
      });
      setProfileSettings({
        profile_type: data.profile_type,
        selected_country: data.selected_country,
      });
    } catch (err) {
      setError('Erreur lors du chargement du profil');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);
      const response = await authAPI.updateUserInfo(userInfo);
      setSuccess('Informations mises à jour avec succès');
      setProfile(response.profile);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Validation
    if (passwords.new_password !== passwords.confirm_password) {
      setError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    if (passwords.new_password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      await authAPI.changePassword({
        old_password: passwords.old_password,
        new_password: passwords.new_password,
      });
      setSuccess('Mot de passe modifié avec succès');
      setPasswords({
        old_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du changement de mot de passe');
    }
  };

  const handleUpdateProfileSettings = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);
      await authAPI.updateProfile(profileSettings);
      setSuccess('Paramètres de profil mis à jour');
      loadProfile(); // Recharger pour obtenir les nouvelles limites
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ? Votre compilation sera supprimée.')) {
      try {
        await authAPI.logout();
        navigate('/');
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        // Forcer la déconnexion même en cas d'erreur
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/');
      }
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="display-5">
          <User size={40} className="me-3" />
          Mon Profil
        </h1>
        <p className="text-muted">Gérez vos informations personnelles et paramètres</p>
      </div>

      {/* Alertes */}
      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}

      <Row>
        {/* Colonne gauche - Informations */}
        <Col lg={8}>
          {/* Informations du compte */}
          <Card className="mb-4 shadow-sm">
            <Card.Header>
              <h5 className="mb-0">
                <User size={20} className="me-2" />
                Informations du compte
              </h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleUpdateInfo}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom d'utilisateur</Form.Label>
                  <Form.Control
                    type="text"
                    value={userInfo.username}
                    onChange={(e) => setUserInfo({ ...userInfo, username: e.target.value })}
                    placeholder="Nom d'utilisateur"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <Mail size={16} className="me-1" />
                    Email
                  </Form.Label>
                  <Form.Control
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                    placeholder="Email"
                  />
                </Form.Group>

                <Button variant="primary" type="submit">
                  <Save size={16} className="me-2" />
                  Enregistrer les modifications
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {/* Changement de mot de passe */}
          <Card className="mb-4 shadow-sm">
            <Card.Header>
              <h5 className="mb-0">
                <Lock size={20} className="me-2" />
                Sécurité
              </h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleChangePassword}>
                <Form.Group className="mb-3">
                  <Form.Label>Ancien mot de passe</Form.Label>
                  <Form.Control
                    type="password"
                    value={passwords.old_password}
                    onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })}
                    placeholder="Ancien mot de passe"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Nouveau mot de passe</Form.Label>
                  <Form.Control
                    type="password"
                    value={passwords.new_password}
                    onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                    placeholder="Nouveau mot de passe (min. 8 caractères)"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirmer le nouveau mot de passe</Form.Label>
                  <Form.Control
                    type="password"
                    value={passwords.confirm_password}
                    onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
                    placeholder="Confirmer le mot de passe"
                  />
                </Form.Group>

                <Button variant="warning" type="submit">
                  <Shield size={16} className="me-2" />
                  Changer le mot de passe
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {/* Paramètres du profil */}
          <Card className="mb-4 shadow-sm">
            <Card.Header>
              <h5 className="mb-0">
                <Award size={20} className="me-2" />
                Paramètres du profil
              </h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleUpdateProfileSettings}>
                <Form.Group className="mb-3">
                  <Form.Label>Type de profil</Form.Label>
                  <Form.Select
                    value={profileSettings.profile_type}
                    onChange={(e) => setProfileSettings({ ...profileSettings, profile_type: e.target.value })}
                  >
                    <option value="tourist">🎒 Touriste</option>
                    <option value="local">🏡 Local</option>
                    <option value="professional">💼 Professionnel</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Chaque type de profil a des limites et fonctionnalités différentes
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Pays préféré</Form.Label>
                  <Form.Control
                    type="text"
                    value={profileSettings.selected_country}
                    onChange={(e) => setProfileSettings({ ...profileSettings, selected_country: e.target.value })}
                    placeholder="Ex: France, Italie, Espagne..."
                  />
                </Form.Group>

                <Button variant="success" type="submit">
                  <Save size={16} className="me-2" />
                  Mettre à jour le profil
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Colonne droite - Résumé */}
        <Col lg={4}>
          <Card className="shadow-sm mb-4 sticky-top" style={{ top: '20px' }}>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Résumé du profil</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-3">
                <div 
                  className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center"
                  style={{ width: '80px', height: '80px', fontSize: '32px' }}
                >
                  {profile?.badge_info?.icon || '👤'}
                </div>
              </div>

              <h5 className="text-center mb-3">{profile?.username}</h5>

              {profile?.badge_info && (
                <div className="text-center mb-3">
                  <Badge bg={profile.badge_info.color} className="p-2" style={{ fontSize: '14px' }}>
                    {profile.badge_info.icon} {profile.badge_info.label}
                  </Badge>
                  <p className="text-muted small mt-2">{profile.badge_info.description}</p>
                </div>
              )}

              <hr />

              <div className="mb-2">
                <small className="text-muted">Email</small>
                <p className="mb-0">{profile?.email}</p>
              </div>

              <div className="mb-2">
                <small className="text-muted">Pays</small>
                <p className="mb-0">{profile?.selected_country}</p>
              </div>

              {profile?.compilation_limit && (
                <div className="mb-2">
                  <small className="text-muted">Limite compilation</small>
                  <p className="mb-0">
                    <strong>{profile.compilation_limit}</strong> attractions
                  </p>
                </div>
              )}

              <hr />

              <div className="d-grid gap-2">
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => navigate('/compilation')}
                >
                  📋 Ma Compilation
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={() => navigate('/home')}
                >
                  🏠 Accueil
                </Button>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut size={16} className="me-1" />
                  Déconnexion
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
