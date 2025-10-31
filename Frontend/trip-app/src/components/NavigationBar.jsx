import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, BookmarkCheck, LogOut, User } from 'lucide-react';
import { authAPI } from '../services/api';

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('accessToken');

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

  // Ne pas afficher la navbar sur la landing page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <Navbar bg="primary" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
          🌍 Trip Explorer
        </Navbar.Brand>
        
        {isAuthenticated && (
          <>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                <Nav.Link onClick={() => navigate('/home')} active={location.pathname === '/home'}>
                  <Home size={18} className="me-1" />
                  Accueil
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/search')} active={location.pathname === '/search'}>
                  <Search size={18} className="me-1" />
                  Recherche
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/compilation')} active={location.pathname === '/compilation'}>
                  <BookmarkCheck size={18} className="me-1" />
                  Ma Compilation
                </Nav.Link>
                <Nav.Link onClick={handleLogout}>
                  <LogOut size={18} className="me-1" />
                  Déconnexion
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </>
        )}

        {!isAuthenticated && (
          <Nav className="ms-auto">
            <Button variant="outline-light" size="sm" onClick={() => navigate('/login')}>
              <User size={18} className="me-1" />
              Connexion
            </Button>
          </Nav>
        )}
      </Container>
    </Navbar>
  );
};

export default NavigationBar;